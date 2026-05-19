from extensions import db
from datetime import datetime, timezone
import uuid

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200))
    cid = db.Column(db.String(200))
    owner_id = db.Column(db.Integer)
    owner_name = db.Column(db.String(100)) 
    enc_key = db.Column(db.String(500))
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        onupdate=lambda: datetime.now(timezone.utc)
    )
    deleted = db.Column(db.Boolean, default=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    file_size = db.Column(db.Integer) #  (bytes)
    file_type = db.Column(db.String(50)) #  (image/pdf/etc)
    is_starred = db.Column(db.Boolean, default=False)
    is_shared = db.Column(db.Boolean, default=False)
    share_token = db.Column(db.String(200), unique=True, nullable=True)
    pinata_cid = db.Column(db.String(255))
    is_pinned = db.Column(db.Boolean, default=False)