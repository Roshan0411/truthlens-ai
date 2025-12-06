import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TruthLensError(Exception):
    """Base exception"""
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(TruthLensError):
    """Validation error"""
    def __init__(self, message):
        super().__init__(message, status_code=400)

class APIError(TruthLensError):
    """API error"""
    def __init__(self, message):
        super().__init__(message, status_code=503)

def handle_error(error):
    """Global error handler"""
    logger.error(f"Error: {str(error)}")
    
    if isinstance(error, TruthLensError):
        return {'error': error.message}, error.status_code
    
    return {'error': 'An unexpected error occurred'}, 500