from flask import Blueprint, jsonify
from ..models import Task
from ..extensions import db
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from datetime import date

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    total = db.session.query(func.count(Task.id)).scalar()
    completed = db.session.query(func.count(Task.id)).filter(Task.status == 'completed').scalar()
    pending = db.session.query(func.count(Task.id)).filter(Task.status != 'completed').scalar()
    overdue = db.session.query(func.count(Task.id)).filter(Task.due_date < date.today()).scalar()
    return jsonify({'totalTasks': total or 0, 'completedTasks': completed or 0, 'pendingTasks': pending or 0, 'overdueTasks': overdue or 0})
