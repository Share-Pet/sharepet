from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from models import db, Pet, Owner
from utils.enums import Species
from utils.validators import validate_pet_data

logger = logging.getLogger(__name__)


class PetService:
    """Service class for pet operations"""
    
    def create_pet(self, pet_data: Dict) -> Dict[str, Any]:
        """
        Create a new pet
        
        Args:
            pet_data: Pet information including owner_id
            
        Returns:
            Dict with success status and created pet data
        """
        try:
            # Validate pet data
            validation = validate_pet_data(pet_data)
            if not validation['valid']:
                return {'success': False, 'error': validation['error']}
            
            # Verify owner exists
            owner = Owner.query.get(pet_data['owner_id'])
            if not owner or not owner.is_active:
                return {'success': False, 'error': 'Owner not found'}
            
            # Validate species
            try:
                species = Species(pet_data['species'])
            except ValueError:
                valid_species = [s.value for s in Species]
                return {
                    'success': False,
                    'error': f'Invalid species. Must be one of: {valid_species}'
                }
            
            # Create pet
            new_pet = Pet(
                owner_id=pet_data['owner_id'],
                name=pet_data['name'],
                species=species,
                breed=pet_data.get('breed'),
                age_years=pet_data.get('age_years', 0),
                age_months=pet_data.get('age_months', 0),
                gender=pet_data.get('gender'),
                weight_kg=pet_data.get('weight_kg'),
                color=pet_data.get('color'),
                is_neutered=pet_data.get('is_neutered', False),
                is_vaccinated=pet_data.get('is_vaccinated', False),
                medical_conditions=pet_data.get('medical_conditions'),
                bio=pet_data.get('bio'),
                profile_image=pet_data.get('profile_image'),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True
            )
            
            db.session.add(new_pet)
            db.session.commit()
            
            logger.info(f"Pet created: {new_pet.id} for owner {owner.id}")
            
            return {
                'success': True,
                'data': {
                    'message': 'Pet added successfully',
                    'pet': self._format_pet_response(new_pet)
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating pet: {str(e)}")
            return {'success': False, 'error': 'Failed to add pet'}
    
    def get_pet_details(self, pet_id: int, owner_id: int) -> Dict[str, Any]:
        """
        Get pet details
        
        Args:
            pet_id: Pet ID
            owner_id: Owner ID for verification
            
        Returns:
            Dict with pet details or error
        """
        try:
            pet = Pet.query.filter_by(
                id=pet_id,
                owner_id=owner_id,
                is_active=True
            ).first()
            
            if not pet:
                return {
                    'success': False,
                    'error': 'Pet not found',
                    'status_code': 404
                }
            
            return {
                'success': True,
                'data': {
                    'pet': self._format_pet_response(pet, detailed=True)
                }
            }
            
        except Exception as e:
            logger.error(f"Error fetching pet {pet_id}: {str(e)}")
            return {'success': False, 'error': 'Failed to fetch pet details'}
    
    def update_pet(self, pet_id: int, owner_id: int, update_data: Dict) -> Dict[str, Any]:
        """
        Update pet details
        
        Args:
            pet_id: Pet ID
            owner_id: Owner ID for verification
            update_data: Fields to update
            
        Returns:
            Dict with success status
        """
        try:
            pet = Pet.query.filter_by(
                id=pet_id,
                owner_id=owner_id,
                is_active=True
            ).first()
            
            if not pet:
                return {
                    'success': False,
                    'error': 'Pet not found',
                    'status_code': 404
                }
            
            # Allowed fields for update
            allowed_fields = [
                'name', 'breed', 'age_years', 'age_months', 'gender',
                'weight_kg', 'color', 'is_neutered', 'is_vaccinated',
                'medical_conditions', 'bio', 'profile_image'
            ]
            
            # Update fields
            updated_fields = []
            for field in allowed_fields:
                if field in update_data and update_data[field] is not None:
                    setattr(pet, field, update_data[field])
                    updated_fields.append(field)
            
            if not updated_fields:
                return {'success': False, 'error': 'No valid fields to update'}
            
            pet.updated_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Pet {pet_id} updated: {updated_fields}")
            
            return {
                'success': True,
                'data': {
                    'message': 'Pet updated successfully',
                    'updated_fields': updated_fields
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating pet {pet_id}: {str(e)}")
            return {'success': False, 'error': 'Failed to update pet'}
    
    def verify_pet_ownership(self, pet_id: int, owner_id: int) -> bool:
        """Verify if a pet belongs to an owner"""
        try:
            pet = Pet.query.filter_by(
                id=pet_id,
                owner_id=owner_id,
                is_active=True
            ).first()
            return pet is not None
        except Exception as e:
            logger.error(f"Error verifying pet ownership: {str(e)}")
            return False
    
    def get_owner_pets(self, owner_id: int) -> List[Pet]:
        """Get all pets for an owner"""
        try:
            return Pet.query.filter_by(
                owner_id=owner_id,
                is_active=True
            ).order_by(Pet.created_at.desc()).all()
        except Exception as e:
            logger.error(f"Error fetching pets for owner {owner_id}: {str(e)}")
            return []
    
    def _format_pet_response(self, pet: Pet, detailed: bool = False) -> Dict:
        """Format pet data for response"""
        response = {
            'id': pet.id,
            'name': pet.name,
            'species': pet.species.value if pet.species else None,
            'breed': pet.breed,
            'age': {
                'years': pet.age_years,
                'months': pet.age_months
            },
            'gender': pet.gender,
            'profile_image': pet.profile_image
        }
        
        if detailed:
            response.update({
                'weight_kg': pet.weight_kg,
                'color': pet.color,
                'medical': {
                    'is_neutered': pet.is_neutered,
                    'is_vaccinated': pet.is_vaccinated,
                    'conditions': pet.medical_conditions
                },
                'bio': pet.bio,
                'created_at': pet.created_at.isoformat() if pet.created_at else None,
                'updated_at': pet.updated_at.isoformat() if pet.updated_at else None
            })
        
        return response
