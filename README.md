# 📋 TaskFlow — Team Task Management System

> A full-stack web application for managing teams, projects, and tasks with role-based access control. Built as an internship assignment at **Ethara**.

---

## 🖼️ Preview

| Login | Dashboard | Projects |
|-------|-----------|----------|
| Clean login with company branding | Stats, recent tasks, project progress | Create & manage projects with team members |

---

## ✨ Features

### 🔐 Authentication
- JWT-based login and signup
- Passwords hashed with Werkzeug
- Persistent sessions via localStorage
- Stale token auto-detection and logout

### 👑 Admin
- Full CRUD on **Projects** and **Tasks**
- Assign members to projects and tasks
- View all members with their task stats and project assignments
- Remove members from the team
- See everything — all projects, all tasks, all members

### 👤 Member
- Self-register via signup page
- See only projects they are assigned to
- See only tasks assigned to them
- Update their own task status (To Do → In Progress → Completed)
- Personal dashboard with their own stats

### 📊 Dashboard
- Total, Completed, Pending, and Overdue task counters
- Recent tasks list with status badges
- Project progress bars with completion percentage
- Role-aware — admin sees team-wide data, members see personal data

### 📁 Projects
- Create projects with title, description, deadline, and team members
- Edit and delete projects (admin only)
- Progress tracking per project
- Member avatars shown on each project card

### ✅ Tasks
- Create tasks with title, description, project, assignee, due date, and status
- Search tasks by title
- Filter by status and project
- Overdue tasks highlighted in red
- Inline status update dropdown

### 👥 Team
- All signed-up members visible to admin
- Per-member stats: total tasks, completed, pending
- Projects each member is part of
- Completion progress bar per member

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS |
| **Forms** | React Hook Form |
| **Routing** | React Router v7 |
| **Notifications** | React Hot Toast |
| **Icons** | Lucide React |
| **Backend** | Python, Flask |
| **Auth** | Flask-JWT-Extended |
| **Database** | SQLite via SQLAlchemy |
| **Migrations** | Flask-Migrate (Alembic) |
| **CORS** | Flask-CORS |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py        # Login, Register
│   │   │   ├── projects.py    # Project CRUD
│   │   │   ├── tasks.py       # Task CRUD
│   │   │   ├── users.py       # Member management
│   │   │   └── dashboard.py   # Stats endpoint
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── config.py          # App configuration
│   │   ├── extensions.py      # DB, JWT, Migrate
│   │   ├── utils.py           # Error handlers, role guard
│   │   └── __init__.py        # App factory + admin seed
│   ├── requirements.txt
│   └── run.py
│
├── src/
│   ├── components/            # Reusable UI components
│   ├── context/               # React context (Auth, App)
│   ├── pages/                 # Page components
│   ├── services/              # API service functions
│   ├── types/                 # TypeScript interfaces
│   └── utils/                 # Helpers (dates, colors)
│
├── public/
│   └── logo.jpeg              # Company logo
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Run database migrations
flask --app run:app db upgrade

# Start the backend server
python run.py
```

Backend runs at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
# From the project root
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### 4. Open the app

Go to **http://localhost:5173** in your browser.

---

## 🔐 Admin Access

The admin account is automatically created on first server start.

| Field | Value |
|-------|-------|
| Email | `yash.handaint17@ethara.ai` |
| Password | `Yash@123` |

> ⚠️ This email is reserved — it cannot be used to sign up as a member.

---

## 🔄 How It Works

```
Member signs up at /signup
        ↓
Admin sees them in Team page
        ↓
Admin creates a Project → assigns members
        ↓
Admin creates Tasks → assigns to members
        ↓
Member logs in → sees their Dashboard, Projects & Tasks
        ↓
Member updates task status → Admin sees progress
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Member signup |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project (admin) |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task (admin) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| DELETE | `/api/users/:id` | Remove member (admin) |

---

## 🗄️ Database Schema

```
users
  id, name, email, password_hash, role, created_at

projects
  id, title, description, deadline, created_by, created_at

project_members (junction)
  user_id, project_id

tasks
  id, title, description, status, due_date,
  assigned_to, project_id, created_by, created_at
```

---

## 👤 Made By

**Yash Handa**
Intern at Ethara

📧 [yash.handaint17@ethara.ai](mailto:yash.handaint17@ethara.ai)

---

<div align="center">
  <sub>Built with ❤️ as part of the Ethara internship assignment</sub>
</div>
