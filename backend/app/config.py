import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(override=True)


def _get_db_url() -> str:
    url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    # Railway (and Heroku) give postgres:// but SQLAlchemy 2.x requires postgresql://
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
    return url


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'taskflow-secret-key-32chars-minimum!!')
    SQLALCHEMY_DATABASE_URI = _get_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'taskflow-jwt-secret-32chars-minimum!!')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
