from __future__ import annotations
from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt
from flask_cors import CORS


def create_app(config_object: str | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_object or Config())
    app.url_map.strict_slashes = False

    # Allow all origins, all headers including Authorization
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": False,
    }})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # register blueprints
    from .routes.auth import auth_bp
    from .routes.projects import projects_bp
    from .routes.tasks import tasks_bp
    from .routes.users import users_bp
    from .routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # error handlers
    from .utils import register_error_handlers
    register_error_handlers(app)

    # seed hardcoded admin on startup
    with app.app_context():
        _seed_admin()

    return app


def _seed_admin():
    from .models import User
    ADMIN_EMAIL = 'yash.handaint17@ethara.ai'
    ADMIN_NAME = 'Yash Handa'
    ADMIN_PASSWORD = 'Yash@123'
    try:
        if not User.query.filter_by(email=ADMIN_EMAIL).first():
            admin = User(name=ADMIN_NAME, email=ADMIN_EMAIL, role='admin')
            admin.set_password(ADMIN_PASSWORD)
            db.session.add(admin)
            db.session.commit()
    except Exception:
        db.session.rollback()
