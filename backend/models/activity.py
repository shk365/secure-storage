from extensions import db
from datetime import datetime, timezone

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100))
    filename = db.Column(db.String(200))
    user_id = db.Column(db.Integer)
    timestamp = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )