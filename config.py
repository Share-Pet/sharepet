import os

from dotenv import load_dotenv
load_dotenv() 

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgres://neondb_owner:npg_PXQ0f5hsxudw@ep-ancient-violet-a44bf5fj-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24) 
    