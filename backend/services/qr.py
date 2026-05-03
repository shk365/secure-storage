import qrcode
import json
import os

QR_FOLDER = "qr_codes"
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_qr(data, filename):
    qr = qrcode.make(json.dumps(data))
    
    path = os.path.join(QR_FOLDER, filename + ".png")
    qr.save(path)
    
    return path