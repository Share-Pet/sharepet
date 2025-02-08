import os
from dotenv import load_dotenv
load_dotenv() 

class Config:
    RAW_DATABASE_URL = os.getenv("DATABASE_URL", "")

    # Dynamically replace scheme if it starts with 'postgres://'
    if RAW_DATABASE_URL.startswith("postgres://"):
        RAW_DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

    SQLALCHEMY_DATABASE_URI = RAW_DATABASE_URL or "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24) 
    