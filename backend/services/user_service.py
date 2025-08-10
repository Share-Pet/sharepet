import logging
import string
import secrets
from typing import Dict, Any, Optional
from datetime import datetime
from models import db, Owner, Pet, EventRegistration
from utils.validators import validate_phone, validate_coordinates
from utils.enums import UserRoles
from utils.slack import log_to_slack

logger = logging.getLogger(__name__)


class UserService:
    """Service class for user operations"""

    def create_user(self, google_id: str, email: str, name: str, 
                                profile_image: Optional[str] = None, referee: Optional[Owner] = None):
        new_user = Owner(
            google_id=google_id,
            email=email,
            name=name,
            profile_image=profile_image,
            referral_code=self._generate_referral_code(),
            referred_by=referee.id if referee else None,
            user_role=UserRoles.USER.value,
            coins_balance=0,  # Start with 0, bonus added separately
            created_at=datetime.now(),
            updated_at=datetime.now(),
            last_login=datetime.now(),
            is_active=True,
            is_deleted=False
        )
        log_to_slack(f"New User Onboarded : {email}", "Info", "create_user")
        
        db.session.add(new_user)
        db.session.flush() 
        return new_user
    
    def _generate_user_referral_code(self, length: int = 8) -> str:
        """Generate unique referral code"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(characters) for _ in range(length))
            if not Owner.query.filter_by(referral_code=code).first():
                return code
    
    def get_user_by_id(self, user_id: int) -> Optional[Owner]:
        """Get active user by ID"""
        try:
            return Owner.query.filter_by(
                id=user_id,
                is_active=True,
                is_deleted=False
            ).first()
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {str(e)}")
            return None
        
    def get_user_by_google_id(self, google_id: int) -> Optional[Owner]:
        """Get active user by ID"""
        try:
            return Owner.query.filter_by(
                google_id=google_id,
                is_active=True,
                is_deleted=False
            ).first()
        except Exception as e:
            logger.error(f"Error fetching user {google_id}: {str(e)}")
            return None
    
    def get_user_by_referral_code(self, referral_code: str) -> Optional[Owner]:
        """Get active user by ID"""
        try:
            return Owner.query.filter_by(
                referral_code=referral_code,
                is_active=True,
                is_deleted=False
            ).first()
        except Exception as e:
            logger.error(f"Error fetching user {referral_code}: {str(e)}")
            return None
    
    def get_user_profile(self, user_id: int) -> Dict[str, Any]:
        """
        Get complete user profile with pets
        
        Args:
            user_id: User ID
            
        Returns:
            Dict with profile data or error
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            # Get user's pets
            pets = Pet.query.filter_by(
                owner_id=user_id,
                is_active=True
            ).order_by(Pet.created_at.desc()).all()
            
            # Get event statistics
            event_stats = self._get_event_stats(user_id)
            
            return {
                'success': True,
                'data': {
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'phone': user.phone,
                        'profile_image': user.profile_image,
                        'user_role': user.user_role,
                        'coins_balance': user.coins_balance,
                        'referral_code': user.referral_code,
                        'member_since': user.created_at.isoformat() if user.created_at else None
                    },
                    'location': {
                        'address': user.address,
                        'city': user.city,
                        'state': user.state,
                        'country': user.country,
                        'pincode': user.pincode,
                        'latitude': user.latitude,
                        'longitude': user.longitude
                    },
                    'pets': [self._format_pet(pet) for pet in pets],
                    'statistics': {
                        'total_pets': len(pets),
                        'events_registered': event_stats['registered'],
                        'events_attended': event_stats['attended']
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {str(e)}")
            return {'success': False, 'error': 'Failed to fetch profile'}
    
    def update_profile(self, user_id: int, update_data: Dict) -> Dict[str, Any]:
        """
        Update user profile
        
        Args:
            user_id: User ID
            update_data: Fields to update
            
        Returns:
            Dict with success status
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            # Allowed fields for update
            allowed_fields = [
                'name', 'phone', 'address', 'city', 'state',
                'country', 'pincode', 'latitude', 'longitude'
            ]
            
            # Validate and update fields
            updated_fields = []
            for field in allowed_fields:
                if field in update_data and update_data[field] is not None:
                    # Validate specific fields
                    if field == 'phone' and not validate_phone(update_data[field]):
                        return {'success': False, 'error': 'Invalid phone number'}
                    
                    if field in ['latitude', 'longitude']:
                        if not validate_coordinates(
                            update_data.get('latitude'),
                            update_data.get('longitude')
                        ):
                            return {'success': False, 'error': 'Invalid coordinates'}
                    
                    setattr(user, field, update_data[field])
                    updated_fields.append(field)
            
            if not updated_fields:
                return {'success': False, 'error': 'No valid fields to update'}
            
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Profile updated for user {user_id}: {updated_fields}")
            
            return {
                'success': True,
                'data': {
                    'message': 'Profile updated successfully',
                    'updated_fields': updated_fields
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile for user {user_id}: {str(e)}")
            return {'success': False, 'error': 'Profile update failed'}
    
    def _get_event_stats(self, user_id: int) -> Dict[str, int]:
        """Get user's event statistics"""
        try:
            registrations = EventRegistration.query.filter_by(owner_id=user_id).all()
            return {
                'registered': len([r for r in registrations if r.status == 'registered']),
                'attended': len([r for r in registrations if r.status == 'attended'])
            }
        except Exception as e:
            logger.error(f"Error fetching event stats: {str(e)}")
            return {'registered': 0, 'attended': 0}
    
    def _format_pet(self, pet: Pet) -> Dict:
        """Format pet data for response"""
        return {
            'id': pet.id,
            'name': pet.name,
            'species': pet.species.value if pet.species else None,
            'breed': pet.breed,
            'age': {
                'years': pet.age_years,
                'months': pet.age_months
            },
            'gender': pet.gender,
            'profile_image': pet.profile_image,
            'is_vaccinated': pet.is_vaccinated,
            'is_neutered': pet.is_neutered
        }