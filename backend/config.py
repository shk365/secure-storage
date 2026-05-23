import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MASTER_KEY = "my_super_secret_master_key_12345"

class Config:
    SECRET_KEY = "your_secret_key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "this_is_a_very_secure_secret_key_12345"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=5)
    