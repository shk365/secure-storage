from app import app
from models import File
from datetime import datetime, timedelta, timezone
from extensions import db

def delete_old_files():
    expiry = datetime.now(timezone.utc) - timedelta(days=30)

    files = File.query.filter(
        File.deleted == True,
        File.deleted_at < expiry
    ).all()

    for file in files:
        db.session.delete(file)

    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        delete_old_files()
        print("Old files deleted ✅")