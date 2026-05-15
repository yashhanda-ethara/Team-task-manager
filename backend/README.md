# Backend (Flask) for Team Task Manager

Setup (local):

1. Create a virtual env and install dependencies:

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and adjust values.

3. Initialize DB and run migrations:

```bash
set FLASK_APP=run.py
flask db init
flask db migrate -m "init"
flask db upgrade
```

4. Run the server:

```bash
python run.py
```

Deployment (Railway):

- Push this backend to a Git repo and connect to Railway.
- Set environment variables from `.env.example` in Railway.
- Railway will run `python run.py` by default (or set start command).
