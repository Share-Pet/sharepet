from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

class UserType(Enum):
    PET = "PET"
    OWNER = "OWNER"
    OTHER = "OTHER"

class user(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.Enum(UserType), nullable=False)
