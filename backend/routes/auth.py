from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from extensions import db

auth = Blueprint("auth", __name__)

@auth.route("/test", methods=["GET"])
def test():
    return {"message": "Auth working"}

@auth.route("/login-test", methods=["GET"])
def login_test():
    return {"message": "Login route exists"}

# REGISTER
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")
    hashed_password = generate_password_hash(password)

    # check if user exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return {"message": "User already exists"}, 400

    # create new user
    new_user = User(
        username=username,
        password=hashed_password  
    )

    db.session.add(new_user)
    db.session.commit()

    return {"message": "User registered successfully"}

# LOGIN
from flask_jwt_extended import create_access_token
@auth.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    print("Entered:", username, password)
    print("DB User:", user)
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "username": username
        })

# PROFILE

from flask_jwt_extended import jwt_required, get_jwt_identity

@auth.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    return {"message": f"Welcome User {user_id}"}