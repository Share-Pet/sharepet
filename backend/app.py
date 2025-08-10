from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import datetime
import os
from dotenv import load_dotenv

from config import Config
from extensions import db, jwt, migrate
from services.auth_service import AuthService
from services.user_service import UserService
from services.pet_service import PetService
from services.event_service import EventService
from middleware.error_handlers import register_error_handlers
from middleware.validators import validate_request
from utils.responses import success_response, error_response
from utils.enums import UserRoles

# Load environment variables
load_dotenv()

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # CORS configuration
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         supports_credentials=True)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Initialize services
    auth_service = AuthService()
    user_service = UserService()
    pet_service = PetService()
    event_service = EventService()
    
    # ============== JWT Configuration ==============
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        """Configure what to store in JWT identity"""
        return user
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """Load user from JWT data"""
        identity = jwt_data["sub"]
        return user_service.get_user_by_id(identity)
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Handle expired token"""
        return error_response("Token has expired", 401)
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """Handle invalid token"""
        return error_response("Invalid token", 401)
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """Handle missing token"""
        return error_response("Authorization required", 401)
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """Handle revoked token"""
        return error_response("Token has been revoked", 401)
    
    # ============== Health Check ==============
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """System health check endpoint"""
        return success_response({
            'status': 'healthy',
            'service': 'Pet Community API',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    # ============== Authentication Endpoints ==============
    # Replace both signup and login endpoints with this single endpoint
    @app.route('/api/v1/auth/google', methods=['POST'])
    @validate_request(['google_id', 'email', 'name'])
    def google_auth():
        """
        Unified Google authentication endpoint
        Frontend sends decoded Google user data
        Creates user if new, returns JWT for both new and existing users
        
        Expects: {
            "google_id": "1234567890",
            "email": "user@example.com", 
            "name": "John Doe",
            "profile_image": "https://..." (optional),
            "referral_code": "ABC123" (optional, only for new users)
        }
        """
        try:
            data = request.get_json()
            
            # Call unified auth service method
            result = auth_service.authenticate_google_user(
                google_id=data.get('google_id'),
                email=data.get('email'),
                name=data.get('name'),
                profile_image=data.get('profile_image'),
                referral_code=data.get('referral_code')
            )
            
            if not result['success']:
                return error_response(result['error'], result.get('status_code', 400))
            
            # Create JWT tokens
            access_token = create_access_token(
                identity=result['user']['id'],
                additional_claims={
                    'email': result['user']['email'],
                    'role': result['user']['user_role']
                },
                fresh=True
            )
            refresh_token = create_refresh_token(identity=result['user']['id'])
            
            return success_response({
                'user': result['user'],
                'is_new_user': result['is_new_user'],
                'tokens': {
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            }, 200)  # Always 200 since it handles both signup and login
            
        except Exception as e:
            return error_response(f"Authentication failed: {str(e)}", 500)
    
    @app.route('/api/v1/auth/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        """Refresh access token using refresh token"""
        try:
            current_user_id = get_jwt_identity()
            user = user_service.get_user_by_id(current_user_id)
            
            if not user:
                return error_response("User not found", 404)
            
            # Create new access token
            access_token = create_access_token(
                identity=user.id,
                additional_claims={
                    'email': user.email,
                    'role': user.user_role
                },
                fresh=False
            )
            
            return success_response({
                'access_token': access_token
            })
            
        except Exception as e:
            return error_response(f"Token refresh failed: {str(e)}", 500)
    
    # ============== User Profile Endpoints ==============
    
    @app.route('/api/v1/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        """Get authenticated user's profile with pets"""
        try:
            current_user_id = get_jwt_identity()
            result = user_service.get_user_profile(current_user_id)
            
            if not result['success']:
                return error_response(result['error'], 404)
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Failed to fetch profile: {str(e)}", 500)
    
    @app.route('/api/v1/profile', methods=['PUT'])
    @jwt_required()
    def update_profile():
        """Update user profile"""
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            
            result = user_service.update_profile(current_user_id, data)
            
            if not result['success']:
                return error_response(result['error'], 400)
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Profile update failed: {str(e)}", 500)
    
    # ============== Pet Management Endpoints ==============
    
    @app.route('/api/v1/pets', methods=['POST'])
    @jwt_required()
    @validate_request(['name', 'species'])
    def add_pet():
        """
        Add a new pet for authenticated user
        Required: name, species
        Optional: breed, age_years, age_months, gender, weight_kg, etc.
        """
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            data['owner_id'] = current_user_id
            
            result = pet_service.create_pet(data)
            
            if not result['success']:
                return error_response(result['error'], 400)
            
            return success_response(result['data'], 201)
            
        except Exception as e:
            return error_response(f"Failed to add pet: {str(e)}", 500)
    
    @app.route('/api/v1/pets/<int:pet_id>', methods=['GET'])
    @jwt_required()
    def get_pet(pet_id):
        """Get pet details"""
        try:
            current_user_id = get_jwt_identity()
            result = pet_service.get_pet_details(pet_id, current_user_id)
            
            if not result['success']:
                return error_response(result['error'], result.get('status_code', 404))
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Failed to fetch pet: {str(e)}", 500)
    
    @app.route('/api/v1/pets/<int:pet_id>', methods=['PUT'])
    @jwt_required()
    def update_pet(pet_id):
        """Update pet details"""
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            
            result = pet_service.update_pet(pet_id, current_user_id, data)
            
            if not result['success']:
                return error_response(result['error'], result.get('status_code', 404))
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Failed to update pet: {str(e)}", 500)
    
    # ============== Event Endpoints ==============
    
    @app.route('/api/v1/events/nearby', methods=['GET'])
    @jwt_required(optional=True)
    def get_nearby_events():
        """
        Get events based on location
        Query params:
        - search_type: 'coordinates' or 'area'
        - For coordinates: latitude, longitude, radius_km
        - For area: city, state (optional), country (optional)
        - page, per_page for pagination
        """
        try:
            current_user_id = get_jwt_identity()
            search_params = {
                'search_type': request.args.get('search_type', 'coordinates'),
                'latitude': request.args.get('latitude', type=float),
                'longitude': request.args.get('longitude', type=float),
                'radius_km': request.args.get('radius_km', 10, type=float),
                'city': request.args.get('city'),
                'state': request.args.get('state'),
                'country': request.args.get('country'),
                'page': request.args.get('page', 1, type=int),
                'per_page': request.args.get('per_page', 10, type=int)
            }
            
            # Validate pagination
            if search_params['page'] < 1 or search_params['per_page'] < 1:
                return error_response("Invalid pagination parameters", 400)
            
            if search_params['per_page'] > 100:
                return error_response("Maximum 100 items per page", 400)
            
            # Get user for default location
            user = None
            if current_user_id:
                user = user_service.get_user_by_id(current_user_id)
            
            result = event_service.search_events(search_params, user)
            
            if not result['success']:
                return error_response(result['error'], 400)
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Failed to fetch events: {str(e)}", 500)
    
    @app.route('/api/v1/events/<int:event_id>/register', methods=['POST'])
    @jwt_required()
    def register_for_event(event_id):
        """
        Register for an event
        Optional: pet_ids (array of pet IDs to register)
        """
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json() or {}
            
            result = event_service.register_for_event(
                event_id=event_id,
                user_id=current_user_id,
                pet_ids=data.get('pet_ids', [])
            )
            
            if not result['success']:
                return error_response(result['error'], result.get('status_code', 400))
            
            return success_response(result['data'], 201)
            
        except Exception as e:
            return error_response(f"Registration failed: {str(e)}", 500)
    
    @app.route('/api/v1/events', methods=['POST'])
    @jwt_required()
    @validate_request(['name', 'event_type', 'start_datetime', 'end_datetime', 
                      'address', 'city', 'latitude', 'longitude'])
    def create_event():
        """
        Create a new event (Admin only)
        Required: name, event_type, start_datetime, end_datetime, 
                 address, city, latitude, longitude
        """
        try:
            # Check admin role
            jwt_data = get_jwt()
            if jwt_data.get('role') != UserRoles.ADMIN.value:
                return error_response("Admin privileges required", 403)
            
            current_user_id = get_jwt_identity()
            data = request.get_json()
            data['creator_id'] = current_user_id
            
            result = event_service.create_event(data)
            
            if not result['success']:
                return error_response(result['error'], 400)
            
            return success_response(result['data'], 201)
            
        except Exception as e:
            return error_response(f"Failed to create event: {str(e)}", 500)
    
    @app.route('/api/v1/events/<int:event_id>', methods=['GET'])
    @jwt_required(optional=True)
    def get_event_details(event_id):
        """Get event details (public endpoint with optional auth)"""
        try:
            current_user_id = get_jwt_identity()  # Will be None if not authenticated
            result = event_service.get_event_details(event_id, current_user_id)
            
            if not result['success']:
                return error_response(result['error'], 404)
            
            return success_response(result['data'])
            
        except Exception as e:
            return error_response(f"Failed to fetch event: {str(e)}", 500)
    
    return app


# Create application instance
app = create_app()

if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all()
    
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 8000)),
        debug=os.environ.get('FLASK_ENV') == 'development'
    )