# SkillSync V2 – Project Workspace & Collaboration Module
## Feature Planning and Implementation Document

### 1. Feature Overview

We want to extend SkillSync from a student project discovery and team formation platform into a complete student project collaboration platform.

Currently, SkillSync allows students to:
- Register and manage their profiles.
- Add skills and discover other students.
- Create and browse projects.
- Find potential teammates.
- Send team invitations.
- Submit and manage join requests.
- Form project teams.

However, after a team is formed, members need a common place to communicate and coordinate their work.

**Proposed solution: Project Workspace**

Every project team should have a dedicated workspace where accepted team members can communicate, manage tasks, share resources and track project progress.

### 2. Main Objective

Create a centralized collaboration space for every project team.

The expected student journey:

Discover Students → Find Projects → Form a Team → Access Workspace → Collaborate → Complete Project → Showcase Work.

### 3. Proposed Features

#### A. Project Workspace
- Automatically create a workspace when a project team is formed.
- Associate the workspace with its existing Project and Team.
- Display project information and team members.
- Allow access only to accepted team members.
- Provide a dedicated workspace dashboard.

#### B. Team Group Chat
- One group chat for each project workspace.
- Real-time messaging using Socket.IO.
- Display sender name, message and timestamp.
- Store messages permanently in PostgreSQL.
- Load previous messages when a student opens the chat.
- Only workspace members can send and read messages.
- Later enhancements: message replies, file attachments, unread counts and notifications.

#### C. Task Management
- Create project tasks.
- Assign tasks to team members.
- Set task descriptions and deadlines.
- Track task status:
  - TODO
  - IN_PROGRESS
  - COMPLETED
- Allow members to update their assigned tasks.
- Display task progress in the workspace.

#### D. Shared Resources
- Share useful project links.
- Upload documents and PDFs.
- Store project references.
- Display resources to all authorized team members.

#### E. Project Activity
Maintain a timeline of important project activities:
- Workspace created.
- Member joined.
- Task created.
- Task assigned.
- Task completed.
- Resource shared.

#### F. Workspace Members
- Display all accepted team members.
- Show member profiles and skills.
- Identify the project/team creator.
- Reflect membership changes when a member joins or leaves.

### 4. Proposed Technology Stack

Use the existing SkillSync V2 technology stack.

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Existing JWT authentication |
| Real-time communication | Socket.IO |
| API architecture | REST APIs |
| Styling | Existing SkillSync CSS design |

Important architecture principle:

React → Express API / Socket.IO → PostgreSQL

The backend handles authentication, authorization, workspace logic and message persistence. PostgreSQL remains the source of truth.

### 5. Database Planning

First inspect the existing Prisma schema and reuse existing relationships.

Existing concepts to preserve:
- Student
- Project
- Team
- TeamMember
- Invitation
- JoinRequest

Potential new models:

**ProjectWorkspace**
- id
- projectId
- teamId
- createdAt
- updatedAt

**WorkspaceMessage**
- id
- workspaceId
- senderId
- content
- createdAt
- updatedAt (optional, for future editing)

**WorkspaceTask**
- id
- workspaceId
- title
- description
- assignedToId
- status
- dueDate
- createdById
- createdAt
- updatedAt

**WorkspaceResource**
- id
- workspaceId
- uploadedById
- title
- description
- resourceType
- resourceUrl
- createdAt

**WorkspaceActivity**
- id
- workspaceId
- studentId
- activityType
- description
- createdAt

These are proposed models, not finalized schema definitions. Check existing models, enums, constraints and relations before implementation.

### 6. Important Business Rules

1. A project workspace belongs to an existing project and its team.
2. One team should have only one workspace.
3. The workspace should be created automatically when the team is formed.
4. The project creator/team creator should have access.
5. Only accepted team members can access the workspace.
6. Pending invitations and join requests must not grant workspace access.
7. When a member leaves a team, workspace access must be revoked.
8. Users cannot access another team's workspace by changing a URL or ID.
9. Every message must be associated with its workspace and authenticated sender.
10. Messages must be stored in PostgreSQL, not only transmitted through sockets.
11. All workspace APIs and Socket.IO events must enforce server-side authorization.

### 7. Implementation Roadmap

Implement one phase at a time.

**Phase 1 – Existing Architecture Review**
- Inspect the complete Prisma schema.
- Review Project, Team and TeamMember relationships.
- Review invitation acceptance.
- Review join request acceptance.
- Review team creation and member removal.
- Identify the correct point for automatic workspace creation.

**Phase 2 – Workspace Backend**
- Add workspace database model.
- Add Prisma migration.
- Implement workspace service.
- Implement workspace controller.
- Implement workspace routes.
- Add authorization middleware or reusable membership checks.

**Phase 3 – Workspace Frontend**
- Create My Projects page if not already implemented.
- Add Open Workspace action.
- Create workspace overview page.
- Display project information and members.
- Add workspace navigation.

**Phase 4 – Chat Backend**
- Install and configure Socket.IO.
- Authenticate socket connections using existing JWT.
- Implement workspace room joining.
- Validate team membership before joining rooms.
- Implement sending and receiving messages.
- Persist messages in PostgreSQL.
- Load previous messages through REST APIs.

**Phase 5 – Chat Frontend**
- Create group chat interface.
- Display messages and timestamps.
- Add message input and send action.
- Implement real-time message updates.
- Display message history.
- Handle connection and loading states.

**Phase 6 – Task Management**
- Create task APIs.
- Add task assignment.
- Add task status updates.
- Build a Kanban-style task board.
- Display task progress.

**Phase 7 – Shared Resources and Activity**
- Add resource sharing.
- Add secure file upload and access.
- Add activity tracking.
- Display recent workspace updates.

**Phase 8 – Integration and Testing**
- Test workspace creation.
- Test authorization.
- Test invitation and join-request acceptance.
- Test member removal and access revocation.
- Test real-time messaging with multiple students.
- Test message persistence and task operations.
- Review security and data consistency.

### 8. Suggested Frontend Structure

Potential structure (adapt it to the existing repository):

frontend/src/
- pages/
  - MyProjects.jsx
  - Workspace.jsx
- components/workspace/
  - WorkspaceSidebar.jsx
  - WorkspaceOverview.jsx
  - WorkspaceMembers.jsx
  - WorkspaceChat.jsx
  - MessageBubble.jsx
  - WorkspaceTaskBoard.jsx
  - WorkspaceResources.jsx
  - WorkspaceActivity.jsx
- services/
  - workspaceService.js
- context/
  - existing AuthContext.jsx

### 9. Suggested Backend Structure

Adapt to existing backend conventions:

backend/src/
- controllers/
  - workspace.controller.js
  - workspace-message.controller.js
  - workspace-task.controller.js
  - workspace-resource.controller.js
- services/
  - workspace.service.js
  - workspace-message.service.js
  - workspace-task.service.js
  - workspace-resource.service.js
- routes/
  - workspace.routes.js
- middlewares/
  - workspace-access.middleware.js
- sockets/
  - workspace.socket.js

Do not create duplicate utilities or middleware if equivalent functionality already exists.

### 10. Development Rules

- Work on a separate Git feature branch.
- Preserve existing working functionality.
- Do not rewrite the existing Prisma schema unnecessarily.
- Use the existing JavaScript/CommonJS backend conventions.
- Follow the current API response structure.
- Keep controllers thin and business logic in services.
- Validate inputs and handle errors consistently.
- Use database transactions for operations that must succeed together.
- Do not expose private student information in workspace responses.
- Implement one logical task at a time.
- Explain code changes before asking for the next file.
- Do not begin testing until implementation is ready and explicitly approved.

### 11. Recommended MVP Priority

Build the essential collaboration experience first:

1. Automatic workspace creation.
2. Secure workspace access.
3. Persistent group chat.
4. Real-time messaging.
5. Basic task management.

After these work properly, add shared resources, activity feeds and advanced chat features.

### 12. First Task When Resuming

Start by asking for:

`backend/prisma/schema.prisma`

Review the existing Project, Team, TeamMember, Student, Invitation and JoinRequest models.

Do not modify any files yet.

Prepare a database relationship plan and explain exactly how workspace creation will integrate with the existing team formation flow.

**Final Product Vision:**

SkillSync should not stop at helping students find teammates. It should give those teammates the tools to work together, communicate, organize responsibilities and successfully complete projects.