from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
from services import (
    contestant_service, 
    game_service,
    leaderboard_service,
    popularity_service
)

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

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
    contestants = contestant_service.get_all_contestants()
    result = []
    for c in contestants:
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email
        })
    return jsonify({"success": True, "contestants": result})

@app.route('/contestants/<int:contestant_id>', methods=['PUT'])
def update_contestant(contestant_id):
    data = request.get_json()
    c = contestant_service.update_contestant(contestant_id, data)
    return jsonify({"success": True, "contestant": {
        "id": c.id,
        "name": c.name,
        "email": c.email
    }})

@app.route('/contestants/<int:contestant_id>', methods=['DELETE'])
def delete_contestant(contestant_id):
    contestant_service.delete_contestant(contestant_id)
    return jsonify({"success": True, "message": "Contestant deleted"})

@app.route('/games', methods=['POST'])
def create_game():
    try:
        data = request.get_json()
        g = game_service.create_game(data)
        return jsonify({"success": True, "game": {
            "id": g.id,
            "name": g.name,
            "upvotes": g.upvotes
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/games', methods=['GET'])
def get_games():
    games = game_service.get_all_games()
    result = []
    for g in games:
        result.append({"id": g.id, "name": g.name, "upvotes": g.upvotes})
    return jsonify({"success": True, "games": result})

@app.route('/games/<int:game_id>/start', methods=['PUT'])
def start_game(game_id):
    g = game_service.start_game(game_id)
    return jsonify({"success": True, "message": "Game started"})

@app.route('/games/<int:game_id>/end', methods=['PUT'])
def end_game(game_id):
    g = game_service.end_game(game_id)
    return jsonify({"success": True, "message": "Game ended"})

@app.route('/games/<int:game_id>/upvote', methods=['POST'])
def upvote_game(game_id):
    g = game_service.upvote_game(game_id)
    return jsonify({"success": True, "game": {
        "id": g.id,
        "name": g.name,
        "upvotes": g.upvotes
    }})

@app.route('/games/<int:game_id>/join', methods=['POST'])
def join_game(game_id):
    data = request.get_json()
    contestant_id = data.get('contestant_id')
    join_time = data.get('join_time')
    session = game_service.join_game(game_id, contestant_id, join_time)
    return jsonify({"success": True, "session": {
        "session_id": session.id,
        "game_id": session.game_id,
        "contestant_id": session.contestant_id,
        "start_time": str(session.start_time)
    }})

@app.route('/games/<int:game_id>/leave', methods=['POST'])
def leave_game(game_id):
    data = request.get_json()
    session_id = data.get('session_id')
    leave_time = data.get('leave_time')
    session = game_service.leave_game(game_id, session_id, leave_time)
    return jsonify({"success": True, "message": "Session ended"})

@app.route('/games/<int:game_id>/score', methods=['POST'])
def assign_score(game_id):
    data = request.get_json()
    session_id = data.get('session_id')
    score = data.get('score')
    session = game_service.assign_score(game_id, session_id, score)
    return jsonify({"success": True, "session": {
        "session_id": session.id,
        "game_id": session.game_id,
        "contestant_id": session.contestant_id,
        "score": session.score
    }})

@app.route('/leaderboard', methods=['GET'])
def global_leaderboard():
    filter_date = request.args.get('date')  # optional
    lb = leaderboard_service.get_global_leaderboard(filter_date)
    return jsonify({"success": True, "leaderboard": lb})

@app.route('/leaderboard/<int:game_id>', methods=['GET'])
def game_leaderboard(game_id):
    filter_date = request.args.get('date')  # optional
    lb = leaderboard_service.get_game_leaderboard(game_id, filter_date)
    return jsonify({"success": True, "leaderboard": lb})

@app.route('/popularity', methods=['GET'])
def get_popularity():
    scores = popularity_service.get_popularity_scores()
    return jsonify({"success": True, "popularity": scores})


if __name__ == '__main__':
    app.run(debug=True)
