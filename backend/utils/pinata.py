import requests
import os
from dotenv import load_dotenv

load_dotenv()

PINATA_JWT = os.getenv("PINATA_JWT")


def upload_to_pinata(file_path):

    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    headers = {
        "Authorization": f"Bearer {PINATA_JWT}"
    }

    filename = os.path.basename(file_path)

    try:

        with open(file_path, "rb") as f:

            files = {
                "file": (
                    filename,
                    f,
                    "application/octet-stream"
                )
            }

            response = requests.post(
                url,
                files=files,
                headers=headers
            )

        # FILE IS CLOSED HERE

        if response.status_code == 200:

            data = response.json()

            cid = data["IpfsHash"]

            print(f"Uploaded to Pinata: {cid}")

        else:

            print("Pinata Upload Failed")
            print(response.text)

    except Exception as e:

        print(f"Pinata upload error: {e}")

    finally:

        # SAFE TO DELETE HERE
        if os.path.exists(file_path):

            try:
                os.remove(file_path)
                print(f"Deleted temp file: {file_path}")

            except Exception as e:
                print(f"Failed to delete temp file: {e}")