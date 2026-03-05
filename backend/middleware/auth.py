"""
Flask middleware decorators for ContextDic Pro.
"""

from functools import wraps
from flask import request, jsonify


def require_api_secret(secret: str):
    """Create a decorator that enforces the ``X-API-Secret`` header.

    If *secret* is empty, authentication is skipped (development mode).

    Args:
        secret: Expected value of the ``X-API-Secret`` header.

    Returns:
        A Flask route decorator.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not secret:
                # No secret configured → skip auth (dev mode)
                return f(*args, **kwargs)
            header_value = request.headers.get('X-API-Secret', '')
            if header_value != secret:
                return jsonify({
                    'success': False,
                    'error': 'Unauthorized: invalid or missing API secret.',
                    'errorType': 'AUTH_ERROR',
                }), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
