from flask_sqlalchemy import SQLAlchemy
from utils.enums import UserType

db = SQLAlchemy()

class user(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.Enum(UserType), nullable=False)
