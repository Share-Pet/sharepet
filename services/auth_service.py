import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.exc import IntegrityError
import logging

from models import db, Owner, Ledger
from utils.enums import UserRoles
from config import Config

logger = logging.getLogger(__name__)


class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.google_client_id = Config.GOOGLE_CLIENT_ID
        self.signup_bonus = 100
        self.referral_bonus = 50
    
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
            existing_user = Owner.query.filter_by(google_id=idinfo['sub']).first()
            if existing_user:
                return {'success': False, 'error': 'User already exists. Please login.', 'status_code': 409}
            
            # Check email uniqueness
            if Owner.query.filter_by(email=idinfo['email']).first():
                return {'success': False, 'error': 'Email already registered', 'status_code': 409}
            
            # Create new user
            new_user = self._create_user(idinfo, referral_code)
            
            # Process signup bonus and referral
            self._process_signup_bonus(new_user)
            if referral_code:
                self._process_referral(new_user, referral_code)
            
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
    
    def _create_user(self, google_info: Dict, referral_code: Optional[str]) -> Owner:
        """Create new user from Google info"""
        new_user = Owner(
            google_id=google_info['sub'],
            email=google_info['email'],
            name=google_info.get('name', ''),
            profile_image=google_info.get('picture'),
            referral_code=self._generate_referral_code(),
            referred_by=referral_code,
            user_role=UserRoles.USER.value,
            coins_balance=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
            is_active=True,
            is_deleted=False
        )
        db.session.add(new_user)
        db.session.flush()  # Get ID before commit
        return new_user
    
    def _generate_referral_code(self, length: int = 8) -> str:
        """Generate unique referral code"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(characters) for _ in range(length))
            if not Owner.query.filter_by(referral_code=code).first():
                return code
    
    def _process_signup_bonus(self, user: Owner) -> None:
        """Add signup bonus to new user"""
        user.coins_balance += self.signup_bonus
        
        ledger_entry = Ledger(
            owner_id=user.id,
            transaction_type='credit',
            amount=self.signup_bonus,
            balance_after=user.coins_balance,
            category='signup_bonus',
            description='Welcome bonus',
            created_at=datetime.utcnow()
        )
        db.session.add(ledger_entry)
    
    def _process_referral(self, new_user: Owner, referral_code: str) -> None:
        """Process referral bonuses"""
        try:
            referrer = Owner.query.filter_by(
                referral_code=referral_code,
                is_active=True
            ).first()
            
            if not referrer:
                return
            
            # Bonus for referrer
            referrer.coins_balance += self.referral_bonus
            referrer_ledger = Ledger(
                owner_id=referrer.id,
                transaction_type='credit',
                amount=self.referral_bonus,
                balance_after=referrer.coins_balance,
                category='referral_bonus',
                reference_type='referral',
                reference_id=new_user.id,
                description=f'Referral bonus for inviting {new_user.name}',
                created_at=datetime.utcnow()
            )
            db.session.add(referrer_ledger)
            
            # Bonus for new user
            new_user.coins_balance += self.referral_bonus
            referee_ledger = Ledger(
                owner_id=new_user.id,
                transaction_type='credit',
                amount=self.referral_bonus,
                balance_after=new_user.coins_balance,
                category='referral_bonus',
                reference_type='referral',
                reference_id=referrer.id,
                description='Referral joining bonus',
                created_at=datetime.utcnow()
            )
            db.session.add(referee_ledger)
            
        except Exception as e:
            logger.error(f"Referral processing error: {str(e)}")
    
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
