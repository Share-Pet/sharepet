from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy import and_, or_, func
import math
import logging

from models import db, Event, EventRegistration, Owner, Pet, Ledger
from utils.validators import validate_event_data
from utils.location import calculate_distance

logger = logging.getLogger(__name__)


class EventService:
    """Service class for event operations"""
    
    def create_event(self, event_data: Dict) -> Dict[str, Any]:
        """
        Create a new event (Admin only)
        
        Args:
            event_data: Event information including creator_id
            
        Returns:
            Dict with success status and created event data
        """
        try:
            # Validate event data
            validation = validate_event_data(event_data)
            if not validation['valid']:
                return {'success': False, 'error': validation['error']}
            
            # Parse datetime strings
            start_dt = datetime.fromisoformat(event_data['start_datetime'])
            end_dt = datetime.fromisoformat(event_data['end_datetime'])
            
            # Validate datetime logic
            if start_dt >= end_dt:
                return {'success': False, 'error': 'End time must be after start time'}
            
            if start_dt < datetime.utcnow():
                return {'success': False, 'error': 'Event cannot start in the past'}
            
            # Parse optional registration deadline
            reg_deadline = None
            if event_data.get('registration_deadline'):
                reg_deadline = datetime.fromisoformat(event_data['registration_deadline'])
                if reg_deadline > start_dt:
                    return {'success': False, 'error': 'Registration deadline must be before event start'}
            
            # Create event
            new_event = Event(
                creator_id=event_data['creator_id'],
                name=event_data['name'],
                description=event_data.get('description'),
                event_type=event_data['event_type'],
                start_datetime=start_dt,
                end_datetime=end_dt,
                registration_deadline=reg_deadline,
                venue_name=event_data.get('venue_name'),
                address=event_data['address'],
                city=event_data['city'],
                state=event_data.get('state'),
                country=event_data.get('country', 'India'),
                pincode=event_data.get('pincode'),
                latitude=event_data['latitude'],
                longitude=event_data['longitude'],
                max_participants=event_data.get('max_participants'),
                allowed_species=event_data.get('allowed_species'),
                age_restrictions=event_data.get('age_restrictions'),
                is_free=event_data.get('is_free', True),
                entry_fee=event_data.get('entry_fee', 0),
                coins_required=event_data.get('coins_required', 0),
                cover_image=event_data.get('cover_image'),
                gallery_images=event_data.get('gallery_images'),
                status='upcoming',
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.session.add(new_event)
            db.session.commit()
            
            logger.info(f"Event created: {new_event.id} by user {event_data['creator_id']}")
            
            return {
                'success': True,
                'data': {
                    'message': 'Event created successfully',
                    'event': self._format_event_response(new_event)
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating event: {str(e)}")
            return {'success': False, 'error': 'Failed to create event'}
    
    def search_events(self, search_params: Dict, user: Optional[Owner]) -> Dict[str, Any]:
        """
        Search events based on location (coordinates or area)
        
        Args:
            search_params: Search parameters including search_type
            user: Current user for default location
            
        Returns:
            Dict with events list or error
        """
        try:
            search_type = search_params.get('search_type', 'coordinates')
            page = search_params.get('page', 1)
            per_page = min(search_params.get('per_page', 10), 100)
            
            if search_type == 'coordinates':
                return self._search_by_coordinates(search_params, user, page, per_page)
            elif search_type == 'area':
                return self._search_by_area(search_params, page, per_page)
            else:
                return {'success': False, 'error': 'Invalid search type'}
                
        except Exception as e:
            logger.error(f"Error searching events: {str(e)}")
            return {'success': False, 'error': 'Failed to search events'}
    
    def _search_by_coordinates(self, params: Dict, user: Optional[Owner], 
                              page: int, per_page: int) -> Dict[str, Any]:
        """Search events by distance from coordinates"""
        # Get coordinates
        lat = params.get('latitude')
        lon = params.get('longitude')
        radius_km = params.get('radius_km', 10)
        
        # Use user's location if not provided
        if (lat is None or lon is None) and user:
            lat = user.latitude
            lon = user.longitude
        
        if lat is None or lon is None:
            return {'success': False, 'error': 'Location coordinates required'}
        
        # Get all active upcoming events
        query = Event.query.filter(
            Event.is_active == True,
            Event.start_datetime > datetime.utcnow(),
            Event.status == 'upcoming'
        )
        
        # Calculate distance for each event and filter
        events_with_distance = []
        for event in query.all():
            if event.latitude and event.longitude:
                distance = calculate_distance(lat, lon, event.latitude, event.longitude)
                if distance <= radius_km:
                    events_with_distance.append((event, distance))
        
        # Sort by distance
        events_with_distance.sort(key=lambda x: x[1])
        
        # Paginate
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_events = events_with_distance[start_idx:end_idx]
        
        # Format response
        events_data = []
        for event, distance in paginated_events:
            event_dict = self._format_event_response(event)
            event_dict['distance_km'] = round(distance, 2)
            events_data.append(event_dict)
        
        return {
            'success': True,
            'data': {
                'events': events_data,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': len(events_with_distance),
                    'total_pages': math.ceil(len(events_with_distance) / per_page)
                },
                'search_criteria': {
                    'type': 'coordinates',
                    'latitude': lat,
                    'longitude': lon,
                    'radius_km': radius_km
                }
            }
        }
    
    def _search_by_area(self, params: Dict, page: int, per_page: int) -> Dict[str, Any]:
        """Search events by city/area"""
        city = params.get('city')
        state = params.get('state')
        country = params.get('country', 'India')
        
        if not city:
            return {'success': False, 'error': 'City is required for area search'}
        
        # Build query
        query = Event.query.filter(
            Event.is_active == True,
            Event.start_datetime > datetime.utcnow(),
            Event.state == 'upcoming',
            func.lower(Event.city) == func.lower(city)
        )
        
        if state:
            query = query.filter(func.lower(Event.state) == func.lower(state))
        if country:
            query = query.filter(func.lower(Event.country) == func.lower(country))
        
        # Order by start date
        query = query.order_by(Event.start_datetime)
        
        # Paginate
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        events_data = [self._format_event_response(event) for event in paginated.items]
        
        return {
            'success': True,
            'data': {
                'events': events_data,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'total_pages': paginated.pages
                },
                'search_criteria': {
                    'type': 'area',
                    'city': city,
                    'state': state,
                    'country': country
                }
            }
        }
    
    def register_for_event(self, event_id: int, user_id: int, 
                          pet_ids: List[int]) -> Dict[str, Any]:
        """
        Register user and pets for an event
        
        Args:
            event_id: Event ID
            user_id: User ID
            pet_ids: List of pet IDs to register
            
        Returns:
            Dict with registration status
        """
        try:
            # Get event
            event = Event.query.filter_by(
                id=event_id,
                is_active=True
            ).first()
            
            if not event:
                return {'success': False, 'error': 'Event not found', 'status_code': 404}
            
            # Check if event is upcoming
            if event.start_datetime <= datetime.utcnow():
                return {'success': False, 'error': 'Cannot register for past events'}
            
            # Check registration deadline
            if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
                return {'success': False, 'error': 'Registration deadline has passed'}
            
            # Check capacity
            if event.max_participants and event.current_participants >= event.max_participants:
                return {'success': False, 'error': 'Event is full'}
            
            # Check for existing registration
            existing = EventRegistration.query.filter_by(
                event_id=event_id,
                owner_id=user_id
            ).first()
            
            if existing and existing.status != 'cancelled':
                return {'success': False, 'error': 'Already registered for this event', 'status_code': 409}
            
            # Verify pet ownership
            pets_to_register = []
            if pet_ids:
                from services.pet_service import PetService
                pet_service = PetService()
                for pet_id in pet_ids:
                    if not pet_service.verify_pet_ownership(pet_id, user_id):
                        return {'success': False, 'error': f'Pet {pet_id} not found or not owned by you'}
                    pets_to_register.append(pet_id)
            
            # Handle payment if required
            user = Owner.query.get(user_id)
            if not event.is_free and event.coins_required > 0:
                if user.coins_balance < event.coins_required:
                    return {'success': False, 'error': 'Insufficient coins balance'}
                
                # Deduct coins
                user.coins_balance -= event.coins_required
                ledger_entry = Ledger(
                    owner_id=user_id,
                    transaction_type='debit',
                    amount=event.coins_required,
                    balance_after=user.coins_balance,
                    category='event_registration',
                    reference_type='event',
                    reference_id=event_id,
                    description=f'Registration for {event.name}',
                    created_at=datetime.utcnow()
                )
                db.session.add(ledger_entry)
            
            # Create registration
            registration = EventRegistration(
                event_id=event_id,
                owner_id=user_id,
                pet_id=pets_to_register[0] if len(pets_to_register) == 1 else None,
                registration_datetime=datetime.utcnow(),
                status='registered',
                payment_method='coins' if event.coins_required > 0 else None,
                coins_used=event.coins_required if event.coins_required > 0 else None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Update event participant count
            event.current_participants += 1
            
            db.session.add(registration)
            db.session.commit()
            
            logger.info(f"User {user_id} registered for event {event_id}")
            
            return {
                'success': True,
                'data': {
                    'message': 'Successfully registered for event',
                    'registration': {
                        'id': registration.id,
                        'event_id': event_id,
                        'status': registration.status,
                        'pets_registered': pets_to_register,
                        'coins_used': registration.coins_used
                    }
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error registering for event: {str(e)}")
            return {'success': False, 'error': 'Registration failed'}
    
    def get_event_details(self, event_id: int, user_id: Optional[int]) -> Dict[str, Any]:
        """Get detailed event information"""
        try:
            event = Event.query.filter_by(
                id=event_id,
                is_active=True
            ).first()
            
            if not event:
                return {'success': False, 'error': 'Event not found'}
            
            event_data = self._format_event_response(event, detailed=True)
            
            # Add registration status if user is authenticated
            if user_id:
                registration = EventRegistration.query.filter_by(
                    event_id=event_id,
                    owner_id=user_id
                ).first()
                
                if registration:
                    event_data['user_registration'] = {
                        'status': registration.status,
                        'registered_at': registration.registration_datetime.isoformat()
                    }
            
            return {
                'success': True,
                'data': {'event': event_data}
            }
            
        except Exception as e:
            logger.error(f"Error fetching event {event_id}: {str(e)}")
            return {'success': False, 'error': 'Failed to fetch event details'}
    
    def _format_event_response(self, event: Event, detailed: bool = False) -> Dict:
        """Format event data for response"""
        response = {
            'id': event.id,
            'name': event.name,
            'event_type': event.event_type,
            'start_datetime': event.start_datetime.isoformat(),
            'end_datetime': event.end_datetime.isoformat(),
            'location': {
                'venue_name': event.venue_name,
                'city': event.city,
                'state': event.state,
                'latitude': event.latitude,
                'longitude': event.longitude
            },
            'capacity': {
                'max_participants': event.max_participants,
                'current_participants': event.current_participants,
                'available_spots': (event.max_participants - event.current_participants) if event.max_participants else None
            },
            'pricing': {
                'is_free': event.is_free,
                'entry_fee': event.entry_fee,
                'coins_required': event.coins_required
            },
            'cover_image': event.cover_image
        }
        
        if detailed:
            response.update({
                'description': event.description,
                'address': event.address,
                'pincode': event.pincode,
                'country': event.country,
                'registration_deadline': event.registration_deadline.isoformat() if event.registration_deadline else None,
                'allowed_species': event.allowed_species,
                'age_restrictions': event.age_restrictions,
                'gallery_images': event.gallery_images,
                'status': event.status,
                'created_at': event.created_at.isoformat() if event.created_at else None
            })
        
        return response