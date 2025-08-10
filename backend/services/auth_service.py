import logging
from datetime import datetime
from typing import Dict, Optional, Any
from sqlalchemy.exc import IntegrityError

from models import db, Owner
from config import Config
from services import user_service, ledger_service
logger = logging.getLogger(__name__)


class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.google_client_id = Config.GOOGLE_CLIENT_ID
        self.signup_bonus = 100
        self.referral_bonus = 50
        self.user_service = user_service.UserService()
        self.ledger_service = ledger_service.LedgerService()
    
    
    # Add this method to AuthService class
    def authenticate_google_user(self, google_id: str, email: str, name: str, 
                                profile_image: Optional[str] = None,
                                referral_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Unified authentication for Google users
        Creates new user if doesn't exist, or returns existing user
        
        Args:
            google_id: Google user ID from frontend
            email: User email from Google
            name: User name from Google
            profile_image: Profile image URL from Google
            referral_code: Optional referral code for new users
            
        Returns:
            Dict with user data and is_new_user flag
        """
        try:
            # Check if user exists by google_id
            existing_user = self.user_service.get_user_by_google_id(google_id)
            
            if existing_user:
                # Existing user - just update last login
                existing_user.last_login = datetime.now()
                
                # Optionally update profile image if changed
                if profile_image and profile_image != existing_user.profile_image:
                    existing_user.profile_image = profile_image
                
                db.session.commit()
                
                logger.info(f"Existing user login: {existing_user.email}")
                
                return {
                    'success': True,
                    'is_new_user': False,
                    'user': self._format_user_response(existing_user)
                }
            
            # Validate referral code if provided
            
            referrer = None
            if referral_code:
                referrer = self.user_service.get_user_by_referral_code(referral_code)
                if not referrer:
                    # Don't fail signup, just ignore invalid referral code
                    logger.warning(f"Invalid referral code provided: {referral_code}")
                    referral_code = None
            
            # Create new user
            new_user = self.user_service.create_user(google_id, email, name, profile_image, referrer)

            db.session.add(new_user)
            db.session.flush()  # Get user ID before processing bonuses
            
            # Process signup bonus through ledger service
            bonus_result = self.ledger_service.process_signup_bonus(new_user.id)
            if not bonus_result['success']:
                logger.error(f"Failed to process signup bonus for user {new_user.id}")
                # Don't fail the signup, user can be credited later
            
            # Process referral bonus if applicable
            if referrer:
                referral_result = self.ledger_service.process_referral_bonus(referrer.id, new_user.id)
                if not referral_result['success']:
                    logger.warning(f"Referral bonus failed for user {new_user.id}")
            
            db.session.commit()
            
            logger.info(f"New user created: {new_user.email}")
            
            return {
                'success': True,
                'is_new_user': True,
                'user': self._format_user_response(new_user)
            }
            
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Database integrity error: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to create user account',
                'status_code': 500
            }
        except Exception as e:
            db.session.rollback()
            logger.error(f"Authentication error: {str(e)}")
            return {
                'success': False,
                'error': 'Authentication failed',
                'status_code': 500
            }

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
