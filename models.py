from flask_sqlalchemy import SQLAlchemy
from utils.enums import UserType, Species, UserRoles

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
    signup_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_deleted = db.Column(db.Boolean, default=False)
    referral_id = db.Column(db.String(100), nullable=True)
    user_role = db.Column(db.String(50), nullable=True, default=UserRoles.USER.value)  # e.g., user, admin, event_organizer
    addresses = db.Column(db.String(255), nullable=True)
    lat_lat = db.Column(db.Float, nullable=True)
    lat_long = db.Column(db.Float, nullable=True)
    coins_balance = db.Column(db.Integer, default=0)

    parent = db.relationship('User', remote_side=[id], backref=db.backref('children', lazy='dynamic'))

# Ledger Model for Tracking Coins
class Ledger(db.Model):
    __tablename__ = 'ledger'
    transaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)  # 'credit' or 'debit'
    amount = db.Column(db.Integer, nullable=False)
    details = db.Column(db.String(255), nullable=True)
    transaction_datetime = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('transactions', lazy=True))

# Events Model
class Event(db.Model):
    __tablename__ = 'events'
    event_id = db.Column(db.Integer, primary_key=True)
    event_start_datetime = db.Column(db.DateTime, nullable=False)
    event_end_datetime = db.Column(db.DateTime, nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(100), nullable=False)
    event_desc = db.Column(db.Text, nullable=True)

# User Registrations for Events
class UserRegistration(db.Model):
    __tablename__ = 'user_registrations'
    registration_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    registration_datetime = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('registrations', lazy=True))
    event = db.relationship('Event', backref=db.backref('registrations', lazy=True))