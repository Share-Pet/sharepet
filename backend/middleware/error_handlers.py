import logging
from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import ValidationError
from jwt.exceptions import PyJWTError

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """Register error handlers with the Flask app"""
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle bad request errors"""
        return jsonify({
            'success': False,
            'error': 'Bad request',
            'message': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized errors"""
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle forbidden errors"""
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle not found errors"""
        return jsonify({
            'success': False,
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle method not allowed errors"""
        return jsonify({
            'success': False,
            'error': 'Method not allowed',
            'message': 'The method is not allowed for the requested URL'
        }), 405
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Handle rate limit errors"""
        return jsonify({
            'success': False,
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors"""
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.errorhandler(SQLAlchemyError)
    def database_error(error):
        """Handle database errors"""
        logger.error(f"Database error: {str(error)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Database error',
            'message': 'A database error occurred'
        }), 500
    
    @app.errorhandler(ValidationError)
    def validation_error(error):
        """Handle validation errors"""
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': error.messages
        }), 400
    
    @app.errorhandler(PyJWTError)
    def jwt_error(error):
        """Handle JWT errors"""
        return jsonify({
            'success': False,
            'error': 'Authentication error',
            'message': str(error)
        }), 401
    
    @app.errorhandler(Exception)
    def unhandled_exception(error):
        """Handle unhandled exceptions"""
        logger.error(f"Unhandled exception: {str(error)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': 'An unexpected error occurred'
        }), 500
