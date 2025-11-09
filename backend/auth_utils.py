"""
Authentication Utilities
Shared authentication decorators and functions
"""

from flask import request, jsonify
from functools import wraps
from .models import Admin


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401

        token = auth_header.split(' ')[1]
        admin = Admin.verify_session(token)

        if not admin:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired session'
            }), 401

        request.admin = admin
        return f(*args, **kwargs)

    return decorated_function
