# 🚀 DevOps AI — Developer Management Dashboard

A full-stack **MERN** (MongoDB, Express, React, Node.js) developer management system. Manage projects, clients, tasks, team, and finances — all with a built-in AI assistant powered by Claude.

---

## 📁 Project Structure

```
devops-dashboard/
├── backend/               ← Node.js + Express API
│   ├── models/            ← MongoDB Mongoose models
│   ├── routes/            ← REST API routes
│   ├── middleware/        ← JWT auth middleware
│   ├── server.js          ← Entry point
│   ├── seed.js            ← Database seeder (demo data)
│   └── .env.example       ← Environment variables template
│
└── frontend/              ← React.js app
    └── src/
        ├── pages/         ← Dashboard, Projects, Tasks, Finance...
        ├── components/    ← Sidebar, Modals, Layout
        ├── context/       ← Auth context (JWT)
        ├── api.js         ← Axios instance
        └── utils.js       ← Helpers & constants
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

---

## 🛠️ Setup & Installation

### Step 1 — Clone / unzip the project

```bash
cd devops-dashboard
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devops_dashboard
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas** — replace MONGO_URI with your Atlas connection string.

### Step 3 — Seed the Database (Demo Data)

```bash
npm run seed
```

This creates:
- ✅ 4 team members
- ✅ 6 clients
- ✅ 6 projects (Royal Pizza, FashionHub, TechBlog, CarRental, HealthCare, EduLearn)
- ✅ 10 tasks (Kanban board)
- ✅ 16 transactions (income + expenses)
- ✅ 8 activity logs

**Default login after seed:**
```
Email:    ahmad@devops.pk
Password: password123
```

### Step 4 — Start the Backend

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs at: `http://localhost:5000`

### Step 5 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🤖 AI Assistant Setup (Claude)

The AI assistant is powered by **Anthropic Claude**. To enable it:

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. The frontend calls the Anthropic API directly from the browser.
3. For production, proxy it through your backend to protect the key.

> Without an API key the dashboard still works fully — only the AI chat won't respond.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| POST   | /api/auth/register | Register new user   |
| POST   | /api/auth/login    | Login               |
| GET    | /api/auth/me       | Get current user    |
| PUT    | /api/auth/profile  | Update profile      |
| POST   | /api/auth/logout   | Logout              |

### Projects
| Method | Endpoint                     | Description           |
|--------|------------------------------|-----------------------|
| GET    | /api/projects                | Get all projects      |
| GET    | /api/projects/:id            | Get single project    |
| POST   | /api/projects                | Create project        |
| PUT    | /api/projects/:id            | Update project        |
| PATCH  | /api/projects/:id/progress   | Update progress only  |
| DELETE | /api/projects/:id            | Delete project        |

### Tasks
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /api/tasks             | Get all tasks        |
| POST   | /api/tasks             | Create task          |
| PUT    | /api/tasks/:id         | Update task          |
| PATCH  | /api/tasks/:id/status  | Quick status change  |
| DELETE | /api/tasks/:id         | Delete task          |

### Finance
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/finance          | Get transactions     |
| GET    | /api/finance/summary  | Revenue summary      |
| POST   | /api/finance          | Add transaction      |
| PUT    | /api/finance/:id      | Update transaction   |
| DELETE | /api/finance/:id      | Delete transaction   |

### Clients, Team, Activity, Dashboard
- Full CRUD on `/api/clients`, `/api/team`
- `/api/dashboard/stats` — aggregated stats
- `/api/activity` — activity log

---

## 🎨 Features

| Feature               | Status |
|-----------------------|--------|
| Auth (JWT)            | ✅     |
| Projects CRUD         | ✅     |
| Kanban Task Board     | ✅     |
| Finance Tracking      | ✅     |
| Client Management     | ✅     |
| Team Management       | ✅     |
| AI Chat (Claude)      | ✅     |
| Revenue Charts        | ✅     |
| Activity Feed         | ✅     |
| Workspace Launcher    | ✅     |
| Dark Theme            | ✅     |
| Responsive Design     | ✅     |
| Demo Seed Data        | ✅     |

---

## 🚀 Deployment

### Backend (Railway / Render / VPS)
```bash
# Set environment variables in your platform
NODE_ENV=production
MONGO_URI=<your-atlas-uri>
JWT_SECRET=<strong-secret>
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Set REACT_APP_API_URL if deploying backend separately
```

Update `frontend/src/api.js` baseURL for production:
```js
const api = axios.create({ baseURL: 'https://your-backend.railway.app/api' });
```

---

## 📦 Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | React 18, React Router 6      |
| Charts      | Chart.js + react-chartjs-2    |
| Styling     | Pure CSS (custom dark theme)  |
| HTTP Client | Axios                         |
| Backend     | Node.js + Express             |
| Database    | MongoDB + Mongoose            |
| Auth        | JWT + bcryptjs                |
| AI          | Anthropic Claude Sonnet 4     |
| Notifications | react-toastify              |

---

## 👨‍💻 Default Team Accounts (after seed)

| Name        | Email              | Password    | Role      |
|-------------|--------------------|-------------|-----------|
| Ahmad Khan  | ahmad@devops.pk    | password123 | Admin     |
| Zara Hassan | zara@devops.pk     | password123 | Designer  |
| M. Rehan    | rehan@devops.pk    | password123 | Developer |
| Sana Malik  | sana@devops.pk     | password123 | QA        |

---

**Built with ❤️ — DevOps AI Dashboard**
