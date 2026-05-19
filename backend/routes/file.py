from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
from services.encryption import encrypt_file, generate_key
from services.ipfs import upload_to_ipfs
from flask_jwt_extended import get_jwt_identity
from models.file import File
from extensions import db
from services.qr import generate_qr
from services.key_manager import encrypt_key
from config import MASTER_KEY
from models.activity import Activity

file_bp = Blueprint("file", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
# Create folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# UPLOAD Route
from utils.pinata import pin_cid
import threading

@file_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    
    user_id = get_jwt_identity()
    
    if "file" not in request.files:
        return {"message": "No file provided"}, 400

    file = request.files["file"]

    file_data = file.read()

    # Generate encryption key
    key = generate_key()

    # Encrypt file
    encrypted_data = encrypt_file(file_data, key)

    # encrypt file key
    secure_key = encrypt_key(key, MASTER_KEY)

    # Save encrypted file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename + ".enc")

    with open(file_path, "wb") as f:
        f.write(encrypted_data)

    # Upload to IPFS
    cid = upload_to_ipfs(file_path)

    # Upload to Pinata
    threading.Thread(
        target=pin_cid,
        args=(cid,)
    ).start()

    # Optionally delete local file
    os.remove(file_path)

    # Save metadata in DB
    new_file = File(
        filename=file.filename,
        cid=cid,
        owner_id=user_id,
        owner_name="User",
        enc_key=secure_key,
        file_size=len(file_data),
        file_type=file.content_type,
        is_pinned=False
    )

    db.session.add(new_file)
    db.session.commit() 


    activity = Activity(
        action="UPLOAD",
        filename=file.filename,
        user_id=user_id
    )
    db.session.add(activity)
    db.session.commit()

    return {
    "message": "Uploaded to IPFS",
    "cid": cid,
    "key": key.decode(),
    }

from flask import send_file, make_response
from flask_jwt_extended import jwt_required
from services.encryption import decrypt_file
import io
from services.ipfs import download_from_ipfs
from services.key_manager import decrypt_key
from config import MASTER_KEY
from flask_cors import CORS
from urllib.parse import quote

# DOWNLOAD Route
from models.shared_file import SharedFile

@file_bp.route("/download", methods=["POST"])
@jwt_required()
def download_file():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    cid = data.get("cid")

    file = File.query.filter_by(cid=cid).first()

    if not file:
        return {"message": "File not found"}, 404
    
    # Access check
    is_shared_user = SharedFile.query.filter_by(
        file_id=file.id,
        shared_with_id=user_id
    ).first()

    public_access = file.is_shared

    if file.owner_id != user_id and not is_shared_user and not public_access:
        return {"message": "Access denied"}, 403

    # decrypt stored key
    file_key = decrypt_key(file.enc_key, MASTER_KEY)

    encrypted_data = download_from_ipfs(cid)
    decrypted_data = decrypt_file(encrypted_data, file_key)

     # Log activity
    activity = Activity(
        action="DOWNLOAD",
        filename=file.filename,
        user_id=user_id
    )

    db.session.add(activity)
    db.session.commit()

    clean_name = file.filename.strip()
    encoded_name = quote(clean_name)
    
    response = make_response(send_file(
    io.BytesIO(decrypted_data),
    as_attachment=True,
    download_name=clean_name,
    mimetype="application/octet-stream"
    ))
    response.headers["Content-Disposition"] = f"attachment; filename*=UTF-8''{encoded_name}"
    
    return response

# FILE LIST

from flask_jwt_extended import jwt_required, get_jwt_identity
from models.file import File

@file_bp.route("/my-files", methods=["GET"])
@jwt_required()
def get_files():
    user_id = int(get_jwt_identity())

    files = File.query.filter_by(owner_id=user_id, deleted=False).all()

    result = []
    for f in files:
        result.append({
            "id": f.id,
            "filename": f.filename,
            "cid": f.cid,
            "file_type": f.file_type,
            "file_size": f.file_size,
            "created_at": f.created_at.isoformat(),
            "is_starred": f.is_starred
        })

    return {"files": result}

# Fetch Logs / Acitivity

@file_bp.route("/activity", methods=["GET"])
@jwt_required()
def get_activity():
    user_id = int(get_jwt_identity())

    logs = Activity.query.filter_by(user_id=user_id).order_by(Activity.timestamp.desc()).all()

    result = []
    for log in logs:
        result.append({
            "action": log.action,
            "filename": log.filename,
            "time": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })

    return {"logs": result}

# DELETE
from datetime import datetime, timezone
from flask_cors import cross_origin

@file_bp.route("/delete", methods=["POST", "OPTIONS"])
@jwt_required()
@cross_origin()
def delete_file():
    from flask_jwt_extended import get_jwt_identity
    user_id = int(get_jwt_identity())

    data = request.json
    file = File.query.get(data["id"])

    if not file:
        return {"message": "File not found"}, 404

    if file.owner_id != user_id:
        return {"message": "Unauthorized"}, 403

    file.deleted = True
    file.deleted_at = datetime.now(timezone.utc)

    db.session.commit()

    return {"msg": "Moved to bin"}, 200

# RESTORE
@file_bp.route("/restore", methods=["POST"])
@jwt_required()
def restore_file():
    data = request.get_json()

    file = File.query.get(data["id"])

    if not file:
        return {"message": "File not found"}, 404

    file.deleted = False
    file.deleted_at = None

    db.session.commit()

    return {"msg": "Restored"}

# BIN
@file_bp.route("/bin", methods=["GET"])
@jwt_required()
def get_bin_files():
    user_id = int(get_jwt_identity())

    files = File.query.filter_by(owner_id=user_id, deleted=True).all()

    result = []
    for f in files:
        result.append({
            "id": f.id,
            "filename": f.filename,
            "cid": f.cid,
            "deleted_at": f.deleted_at.isoformat() if f.deleted_at else None
        })

    return {"files": result}

# DELETE OLD FILES

from datetime import datetime, timedelta

def delete_old_files():
    expiry = datetime.now(timezone.utc) - timedelta(days=30)

    files = File.query.filter(
        File.deleted == True,
        File.deleted_at <= expiry
    ).all()

    for file in files:
        file.delete()

# PERMANENT DELETE

@file_bp.route("/permanent-delete", methods=["POST"])
@jwt_required()
def permanent_delete():
    data = request.get_json()

    file = File.query.get(data["id"])

    if not file:
        return {"message": "File not found"}, 404

    db.session.delete(file)
    db.session.commit()

    return {"message": "Deleted permanently"}

# EMPTY BIN
@file_bp.route("/empty-bin", methods=["POST"])
@jwt_required()
def empty_bin():
    user_id = int(get_jwt_identity())

    files = File.query.filter_by(owner_id=user_id, deleted=True).all()

    for file in files:
        db.session.delete(file)

    db.session.commit()

    return {"message": "Bin emptied successfully"}

# SHARE LINK
import uuid

@file_bp.route("/share/<int:file_id>", methods=["GET"])
@jwt_required()
def share_file(file_id):
    user_id = int(get_jwt_identity())

    file = File.query.get(file_id)

    if not file or file.owner_id != user_id:
        return {"message": "Not allowed"}, 403

    if not file.share_token:
        file.share_token = str(uuid.uuid4())
        db.session.commit()

    share_url = f"http://localhost:3000/share/{file.share_token}"

    return {
        "share_url": share_url
    }

# PUBLIC DOWNLOAD ROUTE
@file_bp.route("/public/<token>", methods=["GET"])
def public_download(token):
    file = File.query.filter_by(share_token=token).first()

    if not file:
        return {"message": "Invalid link"}, 404

    file_key = decrypt_key(file.enc_key, MASTER_KEY)

    encrypted_data = download_from_ipfs(file.cid)
    decrypted_data = decrypt_file(encrypted_data, file_key)

    return send_file(
        io.BytesIO(decrypted_data),
        as_attachment=True,
        download_name=file.filename
    )

# TOGGLE SHARE
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid

@file_bp.route("/toggle-share", methods=["POST"])
@jwt_required()
def toggle_share():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    file = File.query.get(data.get("file_id"))

    if not file or file.owner_id != user_id:
        return {"message": "Not allowed"}, 403

    file.is_shared = not file.is_shared

    if file.is_shared:
        if not file.share_token:
            file.share_token = str(uuid.uuid4())
    else:
        file.share_token = None

    db.session.commit()

    return {
        "enabled": file.is_shared,
        "url": f"http://localhost:3000/share/{file.share_token}" if file.is_shared else None
    }, 200


# Share with people (using username)
from models.user import User
from models.shared_file import SharedFile

@file_bp.route("/share-with", methods=["POST"])
@jwt_required()
def share_with_username():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    file_id = data.get("file_id")
    usernames = data.get("usernames", [])

    file = File.query.get(file_id)

    if not file or file.owner_id != user_id:
        return {"message": "Not allowed"}, 403

    shared_users = []
    not_found = []

    for username in usernames:
        user = User.query.filter_by(username=username).first()

        if not user:
            not_found.append(username)
            continue

        # avoid duplicate
        exists = SharedFile.query.filter_by(
            file_id=file_id,
            shared_with_id=user.id
        ).first()

        if not exists:
            share = SharedFile(
                file_id=file_id,
                owner_id=user_id,
                shared_with_id=user.id
            )
            db.session.add(share)

        shared_users.append(username)

    db.session.commit()

    return {
        "shared_with": shared_users,
        "not_found": not_found
    }

# GET SHARED FILES (FOR RECEIVER)
@file_bp.route("/shared", methods=["GET"])
@jwt_required()
def get_shared():
    user_id = int(get_jwt_identity())

    shared = SharedFile.query.filter_by(
        shared_with_id=user_id
    ).all()

    result = []

    for s in shared:
        file = File.query.get(s.file_id)

        result.append({
            "id": file.id,
            "filename": file.filename,
            "cid": file.cid,             
            "file_type": file.file_type,
            "owner": file.owner_name,
            "time": file.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return {"files": result}

# Star / Unstar
@file_bp.route("/star", methods=["POST"])
@jwt_required()
def toggle_star():
    data = request.get_json()
    file = File.query.get(data["id"])

    file.is_starred = not file.is_starred
    db.session.commit()

    return {"starred": file.is_starred}

# RENAME FILE
@file_bp.route("/rename", methods=["POST"])
@jwt_required()
def rename_file():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    file_id = data.get("id")
    new_name = data.get("new_name")

    if not file_id or not new_name:
        return {"message": "File ID and new name required"}, 400

    file = File.query.get(file_id)

    if not file:
        return {"message": "File not found"}, 404

    # Only owner can rename
    if file.owner_id != user_id:
        return {"message": "Unauthorized"}, 403

    old_name = file.filename

    # update filename
    file.filename = new_name.strip()

    # log activity
    activity = Activity(
        action="RENAME",
        filename=f"{old_name} to {new_name}",
        user_id=user_id
    )

    db.session.add(activity)
    db.session.commit()

    return {
        "message": "File renamed successfully",
        "filename": file.filename
    }, 200