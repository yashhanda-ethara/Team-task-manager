from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'message': 'Name, email and password required.'}), 400

    if email.strip().lower() == 'yash.handaint17@ethara.ai':
        return jsonify({'message': 'This email is reserved.'}), 403

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered.'}), 400

    user = User(name=name, email=email, role='member')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # identity must be a string for Flask-JWT-Extended 4.x
    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    return jsonify({'user': user.to_dict(), 'token': token}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Email and password required.'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials.'}), 401

    # identity must be a string for Flask-JWT-Extended 4.x
    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email})
    return jsonify({'user': user.to_dict(), 'token': token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'Not found'}), 404
    return jsonify({'user': user.to_dict()})
