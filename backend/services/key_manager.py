from cryptography.fernet import Fernet
import base64

def get_master_fernet(master_key):
    key = base64.urlsafe_b64encode(master_key.encode().ljust(32)[:32])
    return Fernet(key)

def encrypt_key(file_key, master_key):
    f = get_master_fernet(master_key)
    return f.encrypt(file_key).decode()

def decrypt_key(enc_key, master_key):
    f = get_master_fernet(master_key)
    return f.decrypt(enc_key.encode())