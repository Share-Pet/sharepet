import json
import logging
import os
from typing import Dict, Any
from enum import Enum
import requests
import inspect

logger = logging.getLogger(__name__)


class SlackChannel(Enum):
    """Slack channel configurations with webhook URLs and payload structure"""
    BACKEND_LOG = {
        'webhook': 'https://hooks.slack.com/triggers/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',
        'required_fields': ['log_message', 'message_type', 'function_name']
    }
    ERRORS = {
        'webhook': 'https://hooks.slack.com/triggers/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',
        'required_fields': ['error_message', 'stack_trace', 'function_name']
    }


def validate_payload(channel: str, payload: Dict[str, Any]) -> bool:
    """Validate payload has required fields for the channel"""
    try:
        channel_config = SlackChannel[channel.upper()].value
        required_fields = channel_config.get('required_fields', [])
        
        missing_fields = [field for field in required_fields if field not in payload]
        
        if missing_fields:
            logger.error(f"Missing required fields for {channel}: {missing_fields}")
            return False
        
        return True
    except KeyError:
        logger.error(f"Unknown channel: {channel}")
        return False


def send_to_slack(payload: Dict[str, Any], channel: str = "backend_log") -> bool:
    """
    Send structured payload to Slack channel
    
    Args:
        payload: Data matching channel's required structure
        channel: Target channel name
        
    Returns:
        True if successful, False otherwise
        
    Example:
        send_to_slack({
            'log_message': 'User login successful',
            'message_type': 'INFO',
            'function_name': 'auth_service.login'
        }, 'backend_log')
    """
    # Validate payload structure
    if not validate_payload(channel, payload):
        return False
    
    try:
        # Get channel configuration
        channel_config = SlackChannel[channel.upper()].value
        webhook_url = channel_config['webhook']
        
        if not webhook_url:
            logger.warning(f"No webhook configured for channel: {channel}")
            return False
        
        # Send request
        response = requests.post(
            webhook_url,
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload),
            timeout=5
        )
        
        if response.status_code != 200:
            logger.error(f"Slack API error: {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send Slack message: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False


# Convenience functions for common use cases

def log_to_slack(message: str, message_type: str = "INFO", function_name: str = "") -> bool:
    """
    Quick logging to backend_log channel
    
    Args:
        message: Log message
        message_type: INFO, WARNING, ERROR, DEBUG
        function_name: Source function/module
    """
    return send_to_slack({
        'log_message': message,
        'message_type': message_type,
        'function_name': function_name or 'unknown'
    }, 'backend_log')



def error_to_slack(message: str, stack_trace: str = "", function_name: str = "") -> bool:
    """
    Send error notification
    
    Args:
        message: Error message
        stack_trace: Error stack trace
        user_id: Affected user ID
    """
    return send_to_slack({
        'error_message': message,
        'stack_trace': stack_trace or 'No trace available',
        'function_name':  function_name or 'unknown'
    }, 'errors')


def get_caller_function(level=2):
    """
    Get the caller function name and file
    
    Args:
        level: Stack level (2 = immediate caller, 3 = caller's caller, etc.)
    """
    try:
        frame_info = inspect.stack()[level]
        filename = os.path.basename(frame_info.filename)  # Just filename, not full path
        function_name = frame_info.function
        line_no = frame_info.lineno
        
        return f"{filename}:{function_name}:{line_no}"
    except (IndexError, AttributeError):
        return "unknown_function"
