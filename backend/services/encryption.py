from cryptography.fernet import Fernet

# Generate key (run once and save)
def generate_key():
    return Fernet.generate_key()

# Encrypt file
def encrypt_file(file_data, key):
    f = Fernet(key)
    return f.encrypt(file_data)

# Decrypt file
def decrypt_file(encrypted_data, key):
    f = Fernet(key)
    return f.decrypt(encrypted_data)