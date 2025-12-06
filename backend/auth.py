from functools import wraps
from flask import request, jsonify
import jwt
from datetime import datetime, timedelta
from config import Config
from database import User

def generate_token(user_id):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_current_user():
    """Get current user from request"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        user_id = verify_token(token)
        if user_id:
            return User.query.get(user_id)
    except:
        pass
    return None

def login_required(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        return f(user=user, *args, **kwargs)
    return decorated_function

def optional_auth(f):
    """Decorator for routes where auth is optional"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        return f(user=user, *args, **kwargs)
    return decorated_function