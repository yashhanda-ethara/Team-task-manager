from datetime import datetime
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


project_members = db.Table(
    'project_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id')),
)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='member', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assigned_tasks = db.relationship('Task', back_populates='assignee', lazy='dynamic', foreign_keys='Task.assigned_to')
    projects = db.relationship('Project', secondary=project_members, back_populates='members')

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
        }


class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('User', secondary=project_members, back_populates='projects')
    tasks = db.relationship('Task', back_populates='project', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'createdBy': str(self.created_by) if self.created_by else None,
            'createdAt': self.created_at.isoformat(),
            'memberIds': [str(m.id) for m in self.members],
        }


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='todo')
    due_date = db.Column(db.Date, nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assignee = db.relationship('User', back_populates='assigned_tasks', foreign_keys=[assigned_to])
    project = db.relationship('Project', back_populates='tasks')

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'dueDate': self.due_date.isoformat() if self.due_date else None,
            'assignedTo': str(self.assigned_to) if self.assigned_to else None,
            'projectId': str(self.project_id) if self.project_id else None,
            'createdAt': self.created_at.isoformat(),
            'createdBy': str(self.created_by) if self.created_by else None,
        }
