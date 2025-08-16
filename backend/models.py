from extensions import db
from datetime import datetime
from utils.enums import Species, UserRoles

class Owner(db.Model):
    __tablename__ = 'owners'
    
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False)  # For Google Auth
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    
    # Location details
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    pincode = db.Column(db.String(20), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Account details
    user_role = db.Column(db.String(50), nullable=False, default=UserRoles.USER.value)
    referral_code = db.Column(db.String(100), unique=True, nullable=True)
    referred_by = db.Column(db.String(100), nullable=True)  # Referral code used during signup
    coins_balance = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # Relationships
    pets = db.relationship('Pet', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    transactions = db.relationship('Ledger', backref='owner', lazy='dynamic')
    event_registrations = db.relationship('EventRegistration', backref='owner', lazy='dynamic')
    created_events = db.relationship('Event', backref='creator', lazy='dynamic')


class Pet(db.Model):
    __tablename__ = 'pets'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    
    # Pet details
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.Enum(Species), nullable=False)
    breed = db.Column(db.String(100), nullable=True)
    age_years = db.Column(db.Integer, nullable=True)
    age_months = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)  # Male, Female, Unknown
    weight_kg = db.Column(db.Float, nullable=True)
    color = db.Column(db.String(100), nullable=True)
    
    # Medical info
    is_neutered = db.Column(db.Boolean, default=False)
    is_vaccinated = db.Column(db.Boolean, default=False)
    medical_conditions = db.Column(db.Text, nullable=True)
    
    # Profile
    profile_image = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    event_registrations = db.relationship('EventRegistration', backref='pet', lazy='dynamic')


class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    
    # Event details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    event_type = db.Column(db.String(50), nullable=False)  # meetup, training, competition, adoption, etc.
    
    # Timing
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    registration_deadline = db.Column(db.DateTime, nullable=True)
    
    # Location
    venue_name = db.Column(db.String(200), nullable=True)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    pincode = db.Column(db.String(20), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    
    # Capacity and restrictions
    max_participants = db.Column(db.Integer, nullable=True)
    current_participants = db.Column(db.Integer, default=0)
    allowed_species = db.Column(db.JSON, nullable=True)  # List of allowed species
    age_restrictions = db.Column(db.JSON, nullable=True)  # Min/max age requirements
    
    # Pricing
    is_free = db.Column(db.Boolean, default=True)
    entry_fee = db.Column(db.Float, nullable=True)
    coins_required = db.Column(db.Integer, default=0)
    
    # Status
    status = db.Column(db.String(20), default='upcoming')  # upcoming, ongoing, completed, cancelled
    is_active = db.Column(db.Boolean, default=True)
    
    # Images and media
    cover_image = db.Column(db.String(255), nullable=True)
    gallery_images = db.Column(db.JSON, nullable=True)  # List of image URLs
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    registrations = db.relationship('EventRegistration', backref='event', lazy='dynamic', cascade='all, delete-orphan')


class EventRegistration(db.Model):
    __tablename__ = 'event_registrations'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=True)  # Optional - owner might attend without pet
    
    # Registration details
    registration_datetime = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='registered')  # registered, attended, cancelled, no-show
    
    # Payment details
    payment_status = db.Column(db.String(20), nullable=True)  # pending, completed, refunded
    payment_method = db.Column(db.String(50), nullable=True)  # coins, online, cash
    amount_paid = db.Column(db.Float, nullable=True)
    coins_used = db.Column(db.Integer, nullable=True)
    
    # Check-in details
    checked_in = db.Column(db.Boolean, default=False)
    check_in_time = db.Column(db.DateTime, nullable=True)
    
    # Feedback
    rating = db.Column(db.Integer, nullable=True)  # 1-5 stars
    feedback = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint to prevent duplicate registrations
    __table_args__ = (
        db.UniqueConstraint('event_id', 'owner_id', 'pet_id', name='unique_event_registration'),
    )


class Ledger(db.Model):
    __tablename__ = 'ledger'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'), nullable=False)
    
    # Transaction details
    transaction_type = db.Column(db.String(20), nullable=False)  # credit, debit
    amount = db.Column(db.Integer, nullable=False)
    balance_after = db.Column(db.Integer, nullable=False)  # Balance after this transaction
    
    # Transaction metadata
    category = db.Column(db.String(50), nullable=False)  # signup_bonus, referral, event_registration, etc.
    reference_type = db.Column(db.String(50), nullable=True)  # event, referral, etc.
    reference_id = db.Column(db.Integer, nullable=True)  # ID of related entity
    description = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships are defined in Owner model

