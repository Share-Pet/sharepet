from flask_sqlalchemy import SQLAlchemy
from utils.enums import UserType, Species

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, unique=True, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=False, nullable=False)
    type = db.Column(db.Enum(UserType), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id')) 
    image = db.Column(db.String(255))
    species = db.Column(db.Enum(Species), nullable=False)

    parent = db.relationship('User', remote_side=[id], backref=db.backref('children', lazy='dynamic'))