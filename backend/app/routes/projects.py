from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Project, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('', methods=['GET'])
@projects_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def list_projects():
    projects = Project.query.all()
    return jsonify([p.to_dict() for p in projects])


@projects_bp.route('', methods=['POST'])
@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return jsonify({'message': 'Title required.'}), 400

    project = Project(title=title, description=data.get('description'), created_by=user_id)

    deadline = data.get('deadline')
    if deadline:
        try:
            project.deadline = datetime.fromisoformat(deadline).date()
        except Exception:
            pass

    member_ids = data.get('memberIds') or []
    for mid in member_ids:
        try:
            u = User.query.get(int(mid))
            if u:
                project.members.append(u)
        except (ValueError, TypeError):
            pass

    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201


@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json() or {}

    for k in ('title', 'description'):
        if k in data:
            setattr(project, k, data[k])

    if 'deadline' in data:
        try:
            project.deadline = datetime.fromisoformat(data['deadline']).date()
        except Exception:
            project.deadline = None

    if 'memberIds' in data:
        project.members = []
        for mid in data['memberIds']:
            try:
                u = User.query.get(int(mid))
                if u:
                    project.members.append(u)
            except (ValueError, TypeError):
                pass

    db.session.commit()
    return jsonify(project.to_dict())


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
