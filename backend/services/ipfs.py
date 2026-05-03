import requests

def upload_to_ipfs(file_path):
    url = "http://127.0.0.1:5001/api/v0/add"
    
    with open(file_path, "rb") as f:
        files = {"file": f}
        res = requests.post(url, files=files)
    
    return res.json()["Hash"]


def download_from_ipfs(cid):
    url = f"http://127.0.0.1:5001/api/v0/cat?arg={cid}"
    
    res = requests.post(url)
    return res.content