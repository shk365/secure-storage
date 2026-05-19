import requests
from dotenv import load_dotenv
import os
from models.file import File
from extensions import db

load_dotenv()
PINATA_JWT = os.getenv("PINATA_JWT")


def pin_cid(cid):

    url = (
        "https://api.pinata.cloud/"
        "pinning/pinByHash"
    )

    headers = {
        "Authorization":
            f"Bearer {PINATA_JWT}"
    }

    data = {
        "hashToPin": cid
    }

    response = requests.post(
        url,
        json=data,
        headers=headers
    )

    if response.status_code == 200:

        file = File.query.filter_by(
            cid=cid
        ).first()

        if file:

            file.is_pinned = True

            db.session.commit()