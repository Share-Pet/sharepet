from flask import Flask, request, jsonify
from utils.db import init_db

from services import (
    contestant_service, 
    game_service,
    leaderboard_service,
    popularity_service
)

app = Flask(__name__)
init_db(app)

@app.route('/health', methods=['GET'])
def get_health():
    return jsonify({"success": True, "message": 'Hey Doc! I am healthy'}), 200

@app.route('/', methods=['GET'])
def home():
    return get_health()
    
@app.route('/contestants', methods=['POST'])
def create_contestant():
    try:
        data = request.get_json()
        c = contestant_service.create_contestant(data)
        return jsonify({"success": True, "contestant": {
            "id": c.id,
            "name": c.name,
            "email": c.email
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/contestants', methods=['GET'])
def get_contestants():
    try:
        contestants = contestant_service.get_all_contestants()
        result = []
        for c in contestants:
            result.append({
                "id": c.id,
                "name": c.name,
                "email": c.email
            })
        return jsonify({"success": True, "contestants": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)