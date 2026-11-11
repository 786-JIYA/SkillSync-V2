# SkillSync

**Find the right teammates for the project you want to build.**

SkillSync is a campus collaboration platform for students. Students list their skills, create or browse projects, get matched by skill fit, form teams through join requests and invitations, and then work together in a shared project workspace with real-time group chat.

> Status: V2 in active development. Authentication, skills, projects, teams, matching, invitations, join requests, student directory and the project workspace chat are implemented.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [How it works](#how-it-works)
4. [UI and design system](#ui-and-design-system)
5. [Pages and routes](#pages-and-routes)
6. [Project workspace and chat](#project-workspace-and-chat)
7. [Data model](#data-model)
8. [API reference](#api-reference)
9. [Project structure](#project-structure)
10. [Getting started](#getting-started)
11. [Environment variables](#environment-variables)
12. [Scripts](#scripts)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [Contributing](#contributing)

---

## Features

**For every student**
- Register and sign in with college details (PRN, department, class year, division).
- Build a skill profile with a 1 to 5 proficiency level per skill.
- Write a short bio and add GitHub and LinkedIn links.
- Browse and search the student directory, and open any student's public profile.
- Track pending invitations and join requests in one place.

**For project creators**
- Create a project with a description, preferred team size and required skills (marked required or nice to have).
- See ranked candidate students and how well each one fills the team's skill gaps.
- Send invitations, and accept or reject join requests.
- See skill coverage for the team.

**For team members**
- Get recommended projects ranked by skill match.
- Send join requests with a message, or accept invitations.
- Open the team workspace to chat with all members in real time.
- Leave a team when needed.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7, plain CSS with design tokens |
| Real-time | Socket.IO (client in the frontend, server in the backend) |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT bearer tokens |
| Email | Transactional email sent from the backend |

The frontend has no UI library. Layout, components and styling are hand-written CSS driven by CSS variables.

---

## How it works

1. A student registers and signs in. The JWT is stored in the browser and sent as `Authorization: Bearer <token>` on every API call.
2. The student adds skills to their profile.
3. A student creates a project. This also creates the project's team, with the creator as the first member.
4. Other students find the project through search or recommendations. Recommendations are ranked by how well their skills match the project's required skills.
5. Teams grow in two ways: a student sends a **join request**, or the creator sends an **invitation** to a suggested candidate. The other side accepts or rejects.
6. Once someone is a team member, they can open the **workspace** and chat with the rest of the team.

---

## UI and design system

The interface was redesigned around one shared layout and one set of design tokens.

### Visual direction

Formal but modern: a deep navy structure, teal for every action, and amber used sparingly for the one or two things that deserve attention (the "New project" button and match scores).

| Role | Color | Used for |
|---|---|---|
| Navy | `#0B1F3A` | Sidebar, hero banners, headings |
| Teal (action) | `#0F766E` | Buttons, links, active states (white text passes AA contrast) |
| Teal (bright) | `#14B8A6` | Accents on navy surfaces only |
| Amber | `#F59E0B` | Rare highlights and match scores |
| Background | `#F7F9FC` | Page background |
| Surface | `#FFFFFF` | Cards and panels |

**Typography:** Sora for headings, Inter for body text.

**Shape and depth:** 8 / 12 / 16 px radii, soft layered shadows, visible keyboard focus rings, and reduced-motion support.

All of this lives as CSS variables in `frontend/src/index.css`, so changing the theme means editing one file.

### Layout

- **Shared app shell** (`components/AppLayout.jsx`): one sidebar, a sticky topbar with breadcrumbs, and a content area. Every signed-in page renders inside it.
- **Sidebar:** navy, grouped into Workspace (Overview, Projects, Student directory) and Me (My activity, My skills, My profile), with an amber **New project** button and a logout button. The active item highlights automatically.
- **Mobile:** below 980px the sidebar becomes a slide-out menu opened from the topbar; it closes on navigation or the Escape key.
- **Auth screens:** a split layout with the product story and an example of ranked candidates on the navy side, and the sign-in or register form on the white side. On small screens the story collapses to a compact header.
- **Dashboard:** a greeting banner, live counts (skills, pending invitations, pending requests, your projects), quick links, and account details.
- **Accessibility:** skip-to-content link, `aria-current` on navigation, labelled form fields, live regions for chat and status messages.

### Screenshots

Add your own screenshots under `docs/screenshots/` and reference them here.

```md
![Sign in](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)
![Browse projects](docs/screenshots/projects.png)
![Workspace chat](docs/screenshots/workspace.png)
```

---

## Pages and routes

Public routes: `/login`, `/register`. Everything else requires a signed-in student and renders inside the shared layout.

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Overview, counts, quick links |
| `/projects` | Browse projects | Search, filter, recommended projects |
| `/projects/create` | Create project | New project with required skills |
| `/projects/:projectId` | Project details | Details, team, join request, recommended students, invitation history, **Open workspace** |
| `/students` | Student directory | Search and filter students |
| `/students/:studentId` | Student profile | Public profile, skills, projects |
| `/skills` | My skills | Add, update and remove skills |
| `/profile` | My profile | Academic info, bio, social links |
| `/my-activity` | My activity | Received invitations and join requests |
| `/teams/:teamId` | Team management | Members, leave team, manage collaboration |
| `/teams/:teamId/requests` | Join requests | Creator reviews incoming requests |
| `/teams/:teamId/invitations` | Invitations | Candidates, skill coverage, sent invitations |
| `/teams/:teamId/workspace` | Workspace | Team info, member list, real-time group chat |

---

## Project workspace and chat

Each team has one workspace. Members open it from **Project details** or **Team management**.

**What it includes**
- Project header with title, description and a live connection badge (Live, Reconnecting, Offline, No access).
- Team member sidebar with roles and links to profiles (collapses behind a button on mobile).
- Persistent message history with day separators, sender names and timestamps.
- Your messages on the right, everyone else's on the left.
- Enter to send, Shift+Enter for a new line, 2,000 character limit.
- "Load earlier messages" pagination that keeps your scroll position.

**How it behaves**
- One socket per team, created in `hooks/useWorkspaceSocket.js`; it joins the workspace room, rejoins after reconnects and fetches any messages missed while offline, and leaves the room on exit.
- Messages are deduplicated by id, so the acknowledgement and the broadcast never produce a double message.
- Access is enforced by the backend. The frontend shows a clear message for 401, 403 and 404 responses.

### Socket events

| Event | Direction | Purpose |
|---|---|---|
| `workspace:join` | Client to server | Join a team's room (membership verified) |
| `workspace:send_message` | Client to server | Send a message `{ teamId, content }` |
| `workspace:new_message` | Server to client | Receive a new message |
| `workspace:leave` | Client to server | Leave the room |

The socket connects with `auth: { token }` using the same JWT as the REST API.

---

## Data model

PostgreSQL via Prisma. Main models:

- **Student**: identity, academic details, bio, social links.
- **Skill** and **StudentSkill**: a skill catalogue and each student's proficiency (1 to 5).
- **Project**: title, description, preferred team size, status (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **ProjectRequiredSkill**: skills a project needs, each `REQUIRED` or `NICE_TO_HAVE`.
- **Team** and **TeamMember**: one team per project; members have a role (`CREATOR` or `MEMBER`).
- **Invitation**: creator to student (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`).
- **JoinRequest**: student to team, with an optional message (same statuses).
- **ProjectWorkspace**: one per team.
- **WorkspaceMessage**: chat messages with sender and timestamp.

The full schema is in `backend/prisma/schema.prisma`.

---

## API reference

Base URL: `http://localhost:5000/api/v1`. All routes except register and login require `Authorization: Bearer <token>`.

**Auth**
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

**Students and skills**
- `GET /students` (query: `page`, `limit`, `search`, `department`)
- `GET /students/:studentId`
- `GET /students/me`, `PATCH /students/me`
- `GET /skills`
- `GET /students/me/skills`
- `PUT /students/me/skills/:skillId` (body: `{ proficiency }`)
- `DELETE /students/me/skills/:skillId`

**Projects**
- `GET /projects`, `GET /projects/me`, `GET /projects/:projectId`
- `POST /projects`, `PATCH /projects/:projectId`
- `PUT /projects/:projectId/required-skills`

**Teams**
- `GET /teams/:teamId`
- `DELETE /teams/:teamId/members/me`

**Join requests**
- `POST /teams/:teamId/join-requests`
- `GET /teams/:teamId/join-requests`
- `GET /join-requests/me`
- `PATCH /join-requests/:requestId` (body: `{ status }`)

**Invitations**
- `POST /teams/:teamId/invitations` (body: `{ inviteeId }`)
- `GET /teams/:teamId/invitations`
- `GET /invitations/me`
- `PATCH /invitations/:invitationId` (body: `{ status }`)

**Matching**
- `GET /matching/projects`
- `GET /teams/:teamId/skill-coverage`
- `GET /teams/:teamId/matching/candidates`

**Workspace**
- `GET /teams/:teamId/workspace`
- `GET /teams/:teamId/workspace/messages?page=1&limit=30`
- `POST /teams/:teamId/workspace/messages` (body: `{ content }`)

Responses use the shape `{ success, message?, data }`. Errors return `success: false` with a message.

---

## Project structure

```text
SkillSync-V2/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── services/            # business logic (e.g. workspace.service.js)
│       └── ...                  # routes, middleware, socket setup
└── frontend/
    └── src/
        ├── App.jsx              # routes (public + shared layout)
        ├── index.css            # design tokens and shared primitives
        ├── main.jsx
        ├── components/
        │   ├── AppLayout.jsx    # sidebar, topbar, mobile drawer
        │   ├── AuthLayout.jsx   # split-screen auth layout
        │   ├── Icon.jsx         # inline icon set and brand mark
        │   ├── ProtectedRoute.jsx
        │   └── workspace/       # chat UI components
        ├── context/
        │   └── AuthContext.jsx  # student, token, login, logout
        ├── hooks/
        │   └── useWorkspaceSocket.js
        ├── pages/               # one file (and stylesheet) per screen
        ├── services/            # one API client per backend area
        └── styles/
            └── workspace.css
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL running locally or hosted
- npm

### 1. Clone

```bash
git clone <your-repository-url>
cd SkillSync-V2
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see [Environment variables](#environment-variables)), then set up the database:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

The API and Socket.IO server run on `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

### 4. Try the workspace

1. Register two students.
2. As the first, create a project (this creates the team and its workspace).
3. As the second, send a join request; as the first, accept it from **Team management**, then **Join requests**.
4. Open the project as both students and click **Open workspace**. Messages appear instantly on both sides.

---

## Environment variables

**Frontend** (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | REST API base URL, e.g. `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | No | Socket.IO server URL. Defaults to the origin of `VITE_API_BASE_URL` |

**Backend** (`backend/.env`)

Set these the way your backend is configured. Typical values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify tokens (REST and socket) |
| `PORT` | Server port (default `5000`) |
| Email settings | Credentials for the transactional email service |

The backend must allow your frontend origin (`http://localhost:5173` in development) in both its Express CORS settings and its Socket.IO CORS settings.

Never commit `.env` files.

---

## Scripts

**Frontend**

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

**Backend**

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-reload |
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma migrate dev` | Apply schema changes to the database |
| `npx prisma studio` | Browse and edit data in the browser |

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `Unknown field workspace for select statement on model Team` | Prisma client is out of date. Stop the server, run `npx prisma generate`, start again |
| Workspace page says "Workspace not found" | The team has no `ProjectWorkspace` row. Create it when a team is created, and backfill existing teams |
| Chat badge stuck on Connecting or Offline | Check Socket.IO CORS includes your frontend URL, and that the socket reads `handshake.auth.token` with the same JWT secret as the REST API |
| "No access" in the workspace | The student is not a member of that team |
| Fonts look different | Google Fonts blocked by the network; the app falls back to system fonts |
| API calls fail with a connection error | Backend not running, or `VITE_API_BASE_URL` is wrong. Restart Vite after editing `.env` |

---

## Roadmap

**Next**
- Loading skeletons for lists and chat.
- Dark mode (all colors are already CSS variables).
- Notification badges in the sidebar for pending invitations and requests.
- Create a workspace automatically with every new team.

**Workspace, later**
- Task management
- File sharing and shared documents
- Activity timeline
- Typing indicators and online status
- Read receipts
- Message editing and deletion
- Notifications

---

## Contributing

1. Create a branch from `main`, for example `feature/your-feature`.
2. Keep each commit focused on one logical change.
3. Make sure the frontend builds (`npm run build`) and lints (`npm run lint`) before opening a pull request.
4. Open a pull request with a short description and screenshots for UI changes.

---

## License

Add your license here.
