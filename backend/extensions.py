from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Database
db = SQLAlchemy()

# JWT Authentication
jwt = JWTManager()

# Database Migrations
migrate = Migrate()

# Rate Limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per hour"]
)


# ==================== middleware/error_handlers.py ====================
