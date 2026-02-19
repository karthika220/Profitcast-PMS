# 🚀 Profitcast — Project Management System

A full-stack, production-ready SaaS Project Management System inspired by ZOHO Projects. Built with React + Vite + Tailwind (frontend) and Node.js + Express + Prisma + PostgreSQL (backend).

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Run](#setup--run)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)

---

## ✨ Features

- **Role-Based Access Control** — MD, HR & Manager, Team Lead, Employee
- **Project Management** — Full lifecycle: Planning → In Progress → Completed → Archived
- **Task Management** — List view + Kanban board, priorities, subtasks, comments
- **Milestone Tracking** — Set checkpoints with target dates and owners
- **Timesheet Logging** — Log hours per task, billable/non-billable tracking
- **Leave Management** — Apply, approve/reject leave requests
- **Notifications** — In-app notification system with unread count
- **Reports & Analytics** — Project health, employee workload, timesheet summary with charts
- **Settings** — Company config, work hours, notification preferences
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (charts)

### Backend
- Node.js + Express.js
- JWT Authentication
- Role-Based Access Control
- MVC Architecture
- Express Validator

### Database
- PostgreSQL
- Prisma ORM (with migrations and seeding)

---

## 📁 Project Structure

```
profitcast/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── pages/              # All page components
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Timesheets.jsx
│   │   │   ├── Leaves.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Profile.jsx
│   │   ├── layouts/            # MainLayout (Sidebar + Topbar)
│   │   ├── context/            # AuthContext
│   │   └── services/           # API service (Axios)
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                     # Node.js Backend
    ├── controllers/            # Business logic
    │   ├── authController.js
    │   ├── userController.js
    │   ├── projectController.js
    │   ├── taskController.js
    │   ├── timesheetController.js
    │   ├── notificationController.js
    │   ├── leaveController.js
    │   ├── settingsController.js
    │   ├── reportController.js
    │   └── activityController.js
    ├── routes/                 # Express routes
    ├── middleware/             # Auth, error, validation
    ├── config/                 # Prisma client
    ├── prisma/
    │   ├── schema.prisma       # Database schema
    │   └── seed.js             # Sample data
    ├── index.js                # Entry point
    ├── .env
    └── package.json
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Step 1: Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 2: Configure Environment

Edit `server/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/profitcast_db?schema=public"
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Setup Database

```bash
# Create database in PostgreSQL first, then:
cd server

# Run migrations
npx prisma migrate dev --name init

# Seed sample data
node prisma/seed.js
```

### Step 4: Run Development Servers

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

Open **http://localhost:5173** 🎉

### Replit Setup

If running on Replit:
1. Create a PostgreSQL repl or use Neon / Supabase
2. Update `DATABASE_URL` in server `.env`
3. Run: `cd server && npm install && npx prisma migrate dev && node prisma/seed.js`
4. Start backend on port 5000, frontend on port 5173

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

### Client (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |

---

## 👤 User Roles

| Role | Label | Capabilities |
|------|-------|-------------|
| `MD` | Managing Director | Full access — all features, system settings |
| `HR_MANAGER` | HR & Manager | Create/manage projects, assign members, approve leaves, view reports |
| `TEAM_LEAD` | Team Lead | Create/assign tasks, view team reports |
| `EMPLOYEE` | Employee | View own tasks, log time, apply leave |

### Permission Matrix

| Feature | MD | HR Manager | Team Lead | Employee |
|---------|:--:|:----------:|:---------:|:--------:|
| Create Projects | ✅ | ✅ | ❌ | ❌ |
| Delete Projects | ✅ | ✅ | ❌ | ❌ |
| Assign Members | ✅ | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ |
| Log Work Hours | ✅ | ✅ | ✅ | ✅ |
| View All Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Approve Leaves | ✅ | ✅ | ❌ | ❌ |

---

## 🔑 Demo Credentials

All accounts use password: **`Password123!`**

| Role | Email |
|------|-------|
| Managing Director | `md@profitcast.com` |
| HR & Manager | `hr@profitcast.com` |
| Manager | `manager@profitcast.com` |
| Team Lead | `teamlead@profitcast.com` |
| Employee | `employee@profitcast.com` |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/register` | Register user | ❌ |
| POST | `/auth/forgot-password` | Request reset link | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/change-password` | Change password | ✅ |

### Users
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | List users | All |
| GET | `/users/:id` | Get user | All |
| POST | `/users` | Create user | MD, HR |
| PUT | `/users/:id` | Update user | MD, HR |
| DELETE | `/users/:id` | Deactivate user | MD, HR |
| PUT | `/users/profile/me` | Update own profile | All |

### Projects
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/projects` | List projects | All |
| GET | `/projects/:id` | Get project detail | All |
| POST | `/projects` | Create project | MD, HR |
| PUT | `/projects/:id` | Update project | MD, HR |
| DELETE | `/projects/:id` | Delete project | MD, HR |
| POST | `/projects/:id/members` | Add member | MD, HR |
| DELETE | `/projects/:id/members/:userId` | Remove member | MD, HR |

### Tasks
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/tasks` | List tasks | All |
| GET | `/tasks/:id` | Get task detail | All |
| GET | `/tasks/overdue` | Get overdue tasks | All |
| POST | `/tasks` | Create task | MD, HR, TL |
| PUT | `/tasks/:id` | Update task | All |
| DELETE | `/tasks/:id` | Delete task | MD, HR, TL |

### Timesheets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/timesheets` | List timesheets |
| POST | `/timesheets` | Log time |
| PUT | `/timesheets/:id` | Update entry |
| DELETE | `/timesheets/:id` | Delete entry |

### Leaves
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/leaves` | List leaves | All |
| POST | `/leaves` | Apply for leave | All |
| PUT | `/leaves/:id/status` | Approve/Reject | MD, HR |
| DELETE | `/leaves/:id` | Cancel request | Owner |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| PUT | `/notifications/read-all` | Mark all as read |
| PUT | `/notifications/:id/read` | Mark one as read |
| DELETE | `/notifications/:id` | Delete notification |

### Reports
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/reports/dashboard` | Dashboard stats | All |
| GET | `/reports/project-health` | Project health | MD, HR |
| GET | `/reports/employee-workload` | Workload report | MD, HR, TL |
| GET | `/reports/timesheet-summary` | Timesheet summary | MD, HR |

---

## 🏢 Business Rules

- Operating Hours: Monday – Saturday, 9:00 AM – 6:45 PM
- Only MD and HR/Manager can create projects and add employees
- HR/Manager and Team Leads receive task/milestone notifications
- Leave requests notify HR/Manager automatically
- Task status changes to "In Review" notify all Team Leads
- Employees can only see their own assigned tasks

---

## 📞 Support

For issues or questions, contact: support@profitcast.com
