from enum import Enum


class UserRoles(Enum):
    """User role types"""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


class Species(Enum):
    """Pet species types"""
    DOG = "dog"
    CAT = "cat"
    BIRD = "bird"
    RABBIT = "rabbit"
    HAMSTER = "hamster"
    GUINEA_PIG = "guinea_pig"
    FISH = "fish"
    TURTLE = "turtle"
    OTHER = "other"


class EventType(Enum):
    """Event types"""
    MEETUP = "meetup"
    TRAINING = "training"
    COMPETITION = "competition"
    ADOPTION = "adoption"
    VACCINATION = "vaccination"
    GROOMING = "grooming"
    WORKSHOP = "workshop"
    FUNDRAISER = "fundraiser"
    OTHER = "other"


class EventStatus(Enum):
    """Event status"""
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RegistrationStatus(Enum):
    """Registration status"""
    REGISTERED = "registered"
    ATTENDED = "attended"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class TransactionType(Enum):
    """Transaction types for ledger"""
    CREDIT = "credit"
    DEBIT = "debit"


class TransactionCategory(Enum):
    """Transaction categories"""
    SIGNUP_BONUS = "signup_bonus"
    REFERRAL_BONUS = "referral_bonus"
    EVENT_REGISTRATION = "event_registration"
    EVENT_REFUND = "event_refund"
    PURCHASE = "purchase"
    REWARD = "reward"
    PENALTY = "penalty"
    OTHER = "other"


class PetGender(Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"