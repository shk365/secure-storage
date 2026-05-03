from extensions import db
from datetime import datetime, timezone

class SharedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    file_id = db.Column(db.Integer, db.ForeignKey("file.id"))
    owner_id = db.Column(db.Integer)  # who shared
    shared_with_id = db.Column(db.Integer)

    permission = db.Column(db.String(20), default="view")  # view / edit

    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))