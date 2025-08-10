from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.exc import IntegrityError
import logging

from models import db, Owner
from config import Config
from services import user_service, ledger_service
from utils.slack import log_to_slack

logger = logging.getLogger(__name__)


class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.google_client_id = Config.GOOGLE_CLIENT_ID
        self.signup_bonus = 100
        self.referral_bonus = 50
        self.user_service = user_service.UserService()
        self.ledger_service = ledger_service.LedgerService()
    
    def signup_with_google(self, google_token: str, referral_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Handle user signup with Google OAuth
        
        Args:
            google_token: Google OAuth token from frontend
            referral_code: Optional referral code
            
        Returns:
            Dict with success status and user data or error
        """
        try:
            # Verify Google token
            idinfo = self._verify_google_token(google_token)
            if not idinfo:
                return {'success': False, 'error': 'Invalid Google token', 'status_code': 401}
            
            # Check if user already exists
            existing_user = self.user_service.get_user_by_google_id(idinfo['sub'])
            if existing_user:
                return {'success': False, 'error': 'User already exists. Please login.', 'status_code': 409}
            
            # Create new user
            referee = None
            if referral_code:
                referee = self.user_service.get_user_by_referral_code(referral_code)
            new_user = self.user_service.create_user(idinfo, referee)
            
            # Process signup bonus and referral
            self.ledger_service.process_signup_bonus(new_user.id)
            if referee:
                self.ledger_service.process_referral_bonus(new_user.id, referee.id)
            
            db.session.commit()
            
            logger.info(f"New user signup: {new_user.email}")
            
            return {
                'success': True,
                'user': self._format_user_response(new_user)
            }
            
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Database integrity error during signup: {str(e)}")
            return {'success': False, 'error': 'User registration failed', 'status_code': 500}
        except Exception as e:
            db.session.rollback()
            log_to_slack(f"{str(e)}", "Error", "authenticate_google_user")
            logger.error(f"Signup error: {str(e)}")
            return {'success': False, 'error': 'Signup failed', 'status_code': 500}
    
    def login_with_google(self, google_token: str) -> Dict[str, Any]:
        """
        Handle user login with Google OAuth
        
        Args:
            google_token: Google OAuth token from frontend
            
        Returns:
            Dict with success status and user data or error
        """
        try:
            # Verify Google token
            idinfo = self._verify_google_token(google_token)
            if not idinfo:
                return {'success': False, 'error': 'Invalid Google token', 'status_code': 401}
            
            # Find user
            user = Owner.query.filter_by(
                google_id=idinfo['sub'],
                is_active=True,
                is_deleted=False
            ).first()
            
            if not user:
                return {'success': False, 'error': 'User not found. Please signup first.', 'status_code': 404}
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"User login: {user.email}")
            
            return {
                'success': True,
                'user': self._format_user_response(user)
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Login error: {str(e)}")
            return {'success': False, 'error': 'Login failed', 'status_code': 500}
    
    def _verify_google_token(self, token: str) -> Optional[Dict]:
        """Verify Google OAuth token"""
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                self.google_client_id
            )
            return idinfo
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return None

    def _format_user_response(self, user: Owner) -> Dict:
        """Format user data for response"""
        return {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'profile_image': user.profile_image,
            'user_role': user.user_role,
            'coins_balance': user.coins_balance,
            'referral_code': user.referral_code,
            'location': {
                'city': user.city,
                'state': user.state,
                'latitude': user.latitude,
                'longitude': user.longitude
            }
        }
