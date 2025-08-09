import re
from typing import Dict, Any
from datetime import datetime


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate phone number (Indian format)"""
    pattern = r'^[+]?[91]?[6-9]\d{9}'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '')))


def validate_coordinates(latitude: Any, longitude: Any) -> bool:
    """Validate geographical coordinates"""
    try:
        lat = float(latitude)
        lon = float(longitude)
        return -90 <= lat <= 90 and -180 <= lon <= 180
    except (TypeError, ValueError):
        return False


def validate_pet_data(data: Dict) -> Dict[str, Any]:
    """
    Validate pet data
    
    Args:
        data: Pet data dictionary
        
    Returns:
        Dict with validation result
    """
    errors = []
    
    # Required fields
    if not data.get('name'):
        errors.append('Pet name is required')
    elif len(data['name']) > 100:
        errors.append('Pet name must be less than 100 characters')
    
    if not data.get('species'):
        errors.append('Pet species is required')
    
    # Optional field validation
    if data.get('age_years') is not None:
        if not isinstance(data['age_years'], int) or data['age_years'] < 0:
            errors.append('Age years must be a positive integer')
    
    if data.get('age_months') is not None:
        if not isinstance(data['age_months'], int) or not (0 <= data['age_months'] < 12):
            errors.append('Age months must be between 0 and 11')
    
    if data.get('weight_kg') is not None:
        try:
            weight = float(data['weight_kg'])
            if weight <= 0 or weight > 200:
                errors.append('Weight must be between 0 and 200 kg')
        except (TypeError, ValueError):
            errors.append('Invalid weight value')
    
    return {
        'valid': len(errors) == 0,
        'error': ', '.join(errors) if errors else None
    }


def validate_event_data(data: Dict) -> Dict[str, Any]:
    """
    Validate event data
    
    Args:
        data: Event data dictionary
        
    Returns:
        Dict with validation result
    """
    errors = []
    
    # Required fields
    required = ['name', 'event_type', 'start_datetime', 'end_datetime', 
                'address', 'city', 'latitude', 'longitude']
    
    for field in required:
        if not data.get(field):
            errors.append(f'{field} is required')
    
    # Validate coordinates
    if data.get('latitude') and data.get('longitude'):
        if not validate_coordinates(data['latitude'], data['longitude']):
            errors.append('Invalid coordinates')
    
    # Validate datetime format
    try:
        if data.get('start_datetime'):
            datetime.fromisoformat(data['start_datetime'])
    except ValueError:
        errors.append('Invalid start_datetime format. Use ISO format')
    
    try:
        if data.get('end_datetime'):
            datetime.fromisoformat(data['end_datetime'])
    except ValueError:
        errors.append('Invalid end_datetime format. Use ISO format')
    
    # Validate numeric fields
    if data.get('max_participants') is not None:
        if not isinstance(data['max_participants'], int) or data['max_participants'] < 1:
            errors.append('Max participants must be a positive integer')
    
    if data.get('entry_fee') is not None:
        try:
            fee = float(data['entry_fee'])
            if fee < 0:
                errors.append('Entry fee cannot be negative')
        except (TypeError, ValueError):
            errors.append('Invalid entry fee value')
    
    return {
        'valid': len(errors) == 0,
        'error': ', '.join(errors) if errors else None
    }

