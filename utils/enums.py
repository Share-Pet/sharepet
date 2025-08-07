from enum import Enum

class UserType(Enum):
    PET = "PET"
    OWNER = "OWNER"
    OTHER = "OTHER"

class UserRoles(Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class Species(Enum):
    HUMAN = "HUMAN"
    DOG = "DOG"
    CAT = "CAT"
    OTHER = "OTHER"

