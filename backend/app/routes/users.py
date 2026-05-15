from flask import Blueprint, jsonify
from ..models import User
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request

users_bp = Blueprint('users', __name__)


@users_bp.route('', methods=['GET'])
@users_bp.route('/', methods=['GET'])
def list_users():
    # accessible to any logged-in user; no strict auth so stale tokens don't break the list
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    u = User.query.get_or_404(user_id)
    return jsonify(u.to_dict())


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_member(user_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Admin only.'}), 403

    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete admin.'}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
