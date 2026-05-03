from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from flask_jwt_extended import JWTManager



app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

jwt = JWTManager(app)
CORS(
        app, 
        resources={r"/*": {"origins": "http://localhost:3000"}},
        supports_credentials=True, 
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Disposition"])

from routes.auth import auth
app.register_blueprint(auth, url_prefix="/auth")

from routes.file import file_bp
app.register_blueprint(file_bp, url_prefix="/file")

@app.route("/")
def home():
    return {"message": "API Running 🚀"}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

