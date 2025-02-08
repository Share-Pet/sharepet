from datetime import datetime
from models import db, Game, Session

def create_game(data):
    name = data.get('name')
    upvotes = data.get('upvotes', 0)
    if not name:
        raise ValueError("Game name is required.")
    new_game = Game(name=name, upvotes=upvotes)
    db.session.add(new_game)
    db.session.commit()
    return new_game

def get_all_games():
    return Game.query.all()

def start_game(game_id):
    game = Game.query.get_or_404(game_id)
    game.start_time = datetime.utcnow()
    db.session.commit()
    return game

def end_game(game_id):
    game = Game.query.get_or_404(game_id)
    game.end_time = datetime.utcnow()
    db.session.commit()
    return game

def upvote_game(game_id):
    game = Game.query.get_or_404(game_id)
    game.upvotes += 1
    db.session.commit()
    return game

def join_game(game_id, contestant_id, join_time=None):
    game = Game.query.get_or_404(game_id)
    if not join_time:
        join_time = datetime.utcnow()

    new_session = Session(
        game_id=game.id,
        contestant_id=contestant_id,
        start_time=datetime.fromisoformat(join_time) if isinstance(join_time, str) else join_time
    )
    db.session.add(new_session)
    db.session.commit()
    return new_session

def leave_game(game_id, session_id, leave_time=None):
    session = Session.query.get_or_404(session_id)
    if session.game_id != game_id:
        raise ValueError("Session does not belong to the specified game.")
    if not leave_time:
        leave_time = datetime.utcnow()
    session.end_time = datetime.fromisoformat(leave_time) if isinstance(leave_time, str) else leave_time
    db.session.commit()
    return session

def assign_score(game_id, session_id, score):
    session = Session.query.get_or_404(session_id)
    if session.game_id != game_id:
        raise ValueError("Session does not belong to the specified game.")
    session.score = score
    db.session.commit()
    return session
