from functools import wraps
from flask import request, jsonify


def validate_request(required_fields):
    """
    Decorator to validate required fields in request body
    
    Args:
        required_fields: List of required field names
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    'success': False,
                    'error': 'Content-Type must be application/json'
                }), 400
            
            data = request.get_json()
            if not data:
                return jsonify({
                    'success': False,
                    'error': 'Request body is required'
                }), 400
            
            missing_fields = []
            for field in required_fields:
                if field not in data or data[field] is None or data[field] == '':
                    missing_fields.append(field)
            
            if missing_fields:
                return jsonify({
                    'success': False,
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def validate_pagination(f):
    """Decorator to validate pagination parameters"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if page < 1:
            return jsonify({
                'success': False,
                'error': 'Page number must be greater than 0'
            }), 400
        
        if per_page < 1 or per_page > 100:
            return jsonify({
                'success': False,
                'error': 'Items per page must be between 1 and 100'
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function

