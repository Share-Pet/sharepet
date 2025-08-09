from typing import Any, Dict
from flask import jsonify


def success_response(data: Any = None, status_code: int = 200) -> tuple:
    """
    Create a standardized success response
    
    Args:
        data: Response data
        status_code: HTTP status code
        
    Returns:
        Flask response tuple
    """
    response = {'success': True}
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code


def error_response(message: str, status_code: int = 400, details: Any = None) -> tuple:
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        details: Additional error details
        
    Returns:
        Flask response tuple
    """
    response = {
        'success': False,
        'error': message
    }
    
    if details is not None:
        response['details'] = details
    
    return jsonify(response), status_code


def paginated_response(items: list, page: int, per_page: int, total: int) -> Dict:
    """
    Create a paginated response structure
    
    Args:
        items: List of items for current page
        page: Current page number
        per_page: Items per page
        total: Total number of items
        
    Returns:
        Dict with paginated data
    """
    import math
    
    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': math.ceil(total / per_page),
            'has_next': page * per_page < total,
            'has_prev': page > 1
        }
    }