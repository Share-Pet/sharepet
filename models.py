from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Contestant(db.Model):
    __tablename__ = 'contestants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

class Game(db.Model):
    __tablename__ = 'games'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    upvotes = db.Column(db.Integer, default=0)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)

class Session(db.Model):
    """
    Represents a single playing session for a contestant in a game.
    """
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    contestant_id = db.Column(db.Integer, db.ForeignKey('contestants.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Integer, default=0)

    # Relationship (not strictly necessary for basic usage)
    contestant = db.relationship('Contestant', backref='sessions')
    game = db.relationship('Game', backref='sessions')
