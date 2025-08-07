from flask import Flask, request, jsonify
from utils.db import init_db

from services import (
    user_service
)

app = Flask(__name__)
init_db(app)

@app.route('/health', methods=['GET'])
def get_health():
    return jsonify({"success": True, "message": 'Hey Doc! I am healthy'}), 200

@app.route('/', methods=['GET'])
def home():
    return get_health()

@app.route('/home', methods=['GET'])
def home():
    return jsonify({"success": True, "message": 'Service is up'}), 200
    
    
@app.route('/profile', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        c = user_service.create_user(data)
        return jsonify({"success": True, "user": {
            "id": c.id,
            "name": c.name,
            "email": c.email
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/profiles', methods=['GET'])
def get_users():
    try:
        users = user_service.get_all_users()
        result = []
        for c in users:
            result.append({
                "id": c.id,
                "name": c.name,
                "email": c.email
            })
        return jsonify({"success": True, "users": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)