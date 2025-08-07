from models import db
from flask import Flask
from config import Config
from flask_migrate import Migrate

def init_db(app: Flask):
    app.config.from_object(Config)
    migrate = Migrate(app, db)
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        