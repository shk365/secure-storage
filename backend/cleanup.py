import requests
from app import app
from extensions import db
from models.file import File

def cleanup_orphaned_cids():

    with app.app_context():

        # All valid DB CIDs
        db_cids = set(
            file.cid for file in File.query.filter_by(deleted=False).all()
        )

        # Get local pinned CIDs
        res = requests.post(
            "http://127.0.0.1:5001/api/v0/pin/ls"
        )

        pins = res.json()

        if "Keys" not in pins:
            return

        local_cids = pins["Keys"].keys()

        # Remove orphaned pins
        for cid in local_cids:

            if cid not in db_cids:

                print(f"Removing orphaned CID: {cid}")

                requests.post(
                    f"http://127.0.0.1:5001/api/v0/pin/rm?arg={cid}"
                )

        # Run garbage collection
        requests.post(
            "http://127.0.0.1:5001/api/v0/repo/gc"
        )

        print("Cleanup completed")


if __name__ == "__main__":
    cleanup_orphaned_cids()