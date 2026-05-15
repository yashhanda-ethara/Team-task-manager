from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Task, User, Project
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('', methods=['GET'])
@tasks_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def list_tasks():
    tasks = Task.query.all()
    return jsonify([t.to_dict() for t in tasks])


@tasks_bp.route('', methods=['POST'])
@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    title = data.get('title')
    if not title:
        return jsonify({'message': 'Title required.'}), 400

    t = Task(title=title, description=data.get('description'), created_by=user_id)

    if data.get('status'):
        t.status = data['status']

    if data.get('dueDate'):
        try:
            t.due_date = datetime.fromisoformat(data['dueDate']).date()
        except Exception:
            pass

    if data.get('projectId'):
        try:
            p = Project.query.get(int(data['projectId']))
            if p:
                t.project = p
        except (ValueError, TypeError):
            pass

    if data.get('assignedTo'):
        try:
            u = User.query.get(int(data['assignedTo']))
            if u:
                t.assignee = u
        except (ValueError, TypeError):
            pass

    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201


@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json() or {}

    for k in ('title', 'description', 'status'):
        if k in data:
            setattr(task, k, data[k])

    if 'dueDate' in data:
        try:
            task.due_date = datetime.fromisoformat(data['dueDate']).date()
        except Exception:
            task.due_date = None

    if 'assignedTo' in data:
        try:
            u = User.query.get(int(data['assignedTo']))
            task.assignee = u
        except (ValueError, TypeError):
            task.assignee = None

    db.session.commit()
    return jsonify(task.to_dict())


@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
