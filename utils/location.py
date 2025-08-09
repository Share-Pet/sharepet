import math
from typing import Tuple, Optional, Dict

R = 6371

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Args:
        lat1, lon1: First coordinate
        lat2, lon2: Second coordinate
        
    Returns:
        Distance in kilometers
    """
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def get_bounding_box(latitude: float, longitude: float, 
                    radius_km: float) -> Tuple[float, float, float, float]:
    """
    Get bounding box coordinates for a given center and radius
    
    Args:
        latitude: Center latitude
        longitude: Center longitude
        radius_km: Radius in kilometers
        
    Returns:
        Tuple of (min_lat, max_lat, min_lon, max_lon)
    """
    # Earth's radius in km
    
    # Calculate latitude bounds
    lat_delta = math.degrees(radius_km / R)
    min_lat = latitude - lat_delta
    max_lat = latitude + lat_delta
    
    # Calculate longitude bounds (accounting for latitude)
    lon_delta = math.degrees(radius_km / (R * math.cos(math.radians(latitude))))
    min_lon = longitude - lon_delta
    max_lon = longitude + lon_delta
    
    return min_lat, max_lat, min_lon, max_lon


def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to coordinates
    Note: This is a placeholder. Implement with actual geocoding service
    
    Args:
        address: Address string
        
    Returns:
        Tuple of (latitude, longitude) or None
    """
    # TODO: Implement with Google Maps API or similar service
    # For now, return None
    return None


def reverse_geocode(latitude: float, longitude: float) -> Optional[Dict]:
    """
    Reverse geocode coordinates to address
    Note: This is a placeholder. Implement with actual geocoding service
    
    Args:
        latitude: Latitude
        longitude: Longitude
        
    Returns:
        Dict with address components or None
    """
    # TODO: Implement with Google Maps API or similar service
    # For now, return None
    return None
