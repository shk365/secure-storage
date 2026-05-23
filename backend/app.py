from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from flask_jwt_extended import JWTManager
import requests
from flask import jsonify
from flask_migrate import Migrate


app = Flask(__name__)
app.config.from_object(Config)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
migrate = Migrate(app, db)
geo_cache = {}

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

@app.route("/api/ipfs/geolocation/<ip>")
def geolocation(ip):

    # CHECK CACHE FIRST
    if ip in geo_cache:
        return jsonify(geo_cache[ip])

    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=10
        )

        data = response.json()

        # SAVE TO CACHE
        geo_cache[ip] = data

        return jsonify(data)

    except Exception as e:
        print("GeoIP Error:", e)

        return jsonify({
            "success": False,
            "message": "Geo lookup failed"
        }), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)