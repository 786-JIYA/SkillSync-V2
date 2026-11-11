# SkillSync V2 — Student Collaboration Platform

<p align="center">
  <strong>Connect. Collaborate. Build. Grow.</strong>
</p>

<p align="center">
  A student collaboration platform to showcase skills, manage projects, build teams, and collaborate through real-time workspace messaging.
</p>

<p align="center">
  <a href="https://skill-sync-v2-six.vercel.app/">🌐 Live Demo</a>
</p>

---

## 🚀 Live Project

**Frontend:** https://skill-sync-v2-six.vercel.app/

**Login:** https://skill-sync-v2-six.vercel.app/login

**Backend API:** https://skillsync-v2-0z63.onrender.com/api/v1

---

## 📌 About SkillSync

SkillSync V2 is a full-stack student collaboration platform designed to help students connect with one another based on their skills and interests.

Students can create profiles, showcase technical skills, manage projects, form teams, send collaboration requests, and communicate with teammates through a real-time project workspace.

The platform aims to make student collaboration more organized, accessible, and productive.

---

## ✨ Features

### 🔐 Authentication
- Student registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected routes and authenticated API requests.

### 👤 Student Profiles
- View and manage student profile information.
- Display academic and personal details.
- Showcase technical skills.
- Explore other students on the platform.

### 💡 Skills Management
- Add and manage technical skills.
- Showcase individual capabilities.
- Discover students with relevant skills.

### 📁 Project Management
- Create and manage projects.
- Explore available projects.
- Connect projects with team collaboration.

### 👥 Team Collaboration
- Create and manage project teams.
- Send and manage team invitations.
- Handle join requests.
- Access team-related project information.

### 💬 Project Workspace
- Dedicated workspace for project teams.
- Real-time group messaging using Socket.IO.
- Retrieve previous workspace messages.
- Collaborate and communicate with teammates.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Authentication | JWT, bcrypt |
| Real-time Communication | Socket.IO |
| Database Hosting | Neon |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |
| Version Control | Git, GitHub |

---

## 🏗️ Project Structure

```text
SkillSync-V2/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── lib/
│   │
│   ├── prisma7.config.ts
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

Follow these instructions to run SkillSync V2 locally.

### 1. Clone the Repository

```bash
git clone https://github.com/786-JIYA/SkillSync-V2.git
```

```bash
cd SkillSync-V2
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

Configure the required environment variables:

```env
PORT=5000

DATABASE_URL=your_pooled_postgresql_connection_string
DIRECT_URL=your_direct_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

If using the email notification functionality, configure the SMTP variables required by the backend as well.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database migrations to your local development database:

```bash
npx prisma migrate dev
```

Start the backend using the development script:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

---

## 🌍 Deployment Architecture

SkillSync V2 uses separate deployment services for the frontend, backend, and database.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| PostgreSQL Database | Neon |
| Real-time Communication | Socket.IO |

### Production URLs

- **Frontend:** https://skill-sync-v2-six.vercel.app/
- **Backend:** https://skillsync-v2-0z63.onrender.com
- **API Base URL:** https://skillsync-v2-0z63.onrender.com/api/v1

---

## 🔒 Security

- Passwords are hashed before storage.
- JWT tokens are used for authentication.
- Protected backend routes require authentication.
- Environment variables are used for sensitive configuration.
- Database credentials and secrets are not committed to the repository.

---

## 🎯 Project Objective

The main objective of SkillSync V2 is to create a collaborative ecosystem where students can:

- Discover people with complementary technical skills.
- Showcase their abilities and project experience.
- Find teammates for collaborative projects.
- Organize team activities.
- Communicate efficiently in real time.

---

## 👩‍💻 Developed By

**Jiya Shaikh**

GitHub: [786-JIYA](https://github.com/786-JIYA)

---

## ⭐ Support

If you find SkillSync useful, consider giving the repository a ⭐ on GitHub!

**SkillSync V2 — Turning individual skills into collaborative possibilities.**
