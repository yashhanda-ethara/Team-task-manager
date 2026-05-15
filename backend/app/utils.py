from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        response = e.get_response()
        return jsonify({'message': e.description}), e.code

    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'message': str(e)}), 500


def role_required(role: str):
    from functools import wraps
    from flask_jwt_extended import verify_jwt_in_request, get_jwt

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != role and claims.get('role') != 'admin':
                return jsonify({'message': 'Forbidden'}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
