# DevOps Learning Portal (DaemonBoard) — Phase 0: Vision & Planning

This document defines the architectural and product vision for the **DevOps Learning Portal** (internally codenamed **DaemonBoard**). It establishes the strategic direction, boundaries, and priorities for building a production-grade 3-tier platform designed to accelerate DevOps learning, project tracking, notes management, and local system/container orchestration monitoring.

---

## 1. Product Vision

The **DevOps Learning Portal** is an all-in-one developer workspace that bridges the gap between theoretical DevOps knowledge and practical execution. Rather than separating learning roadmaps, notes, task tracking, and environment monitoring into disparate apps, this platform fuses them. 

Developers can select a DevOps learning path (e.g., Docker, Kubernetes, CI/CD, Linux Administration), follow interactive nodes, take rich markdown notes, manage their learning tasks on a Kanban board, and monitor their actual running local server processes, docker containers, and system metrics directly from a premium real-time dashboard.

---

## 2. Business Goals

- **Accelerate DevOps Onboarding**: Reduce the time it takes for software engineers to transition into DevOps or system administration roles by providing a structured, interactive learning and workspace environment.
- **Consolidate Tools**: Lower cognitive load for developers by replacing scattered tools (Trello, Notion, System Monitor, and PDF Roadmaps) with a single unified portal.
- **Promote Hands-on Practice**: Create an active learning environment where progress in learning roadmaps directly correlates with executing tasks and setting up projects.
- **Enterprise Readability**: Ensure the codebase and deployment structure serve as a reference implementation of a production-grade 3-tier architecture.

---

## 3. User Personas

### 👤 Alex, Junior Frontend Developer
* **Background**: 2 years of React experience. No professional experience with servers, CI/CD, or terminal commands outside basic git.
* **Needs**: A structured, step-by-step path to learn Docker and understand how frontend builds are packaged and deployed.
* **Pain Points**: Overwhelmed by massive textbooks or unstructured video courses. Forgets terminal commands easily.
* **How DaemonBoard helps**: Alex can import a "Docker Fundamentals" roadmap, follow interactive tasks, copy curated command snippets, and save notes directly inside their project.

### 👤 Sarah, Senior Software Engineer
* **Background**: 6 years of backend engineering (Java/Python). Understands the basics of infrastructure but wants to master Kubernetes, Terraform, and cloud-native monitoring.
* **Needs**: A platform that doesn't just explain concepts, but acts as a sandbox workspace where she can organize her notes, track complex setups, and monitor system resources.
* **Pain Points**: Needs a workspace that links architectural notes, configuration files, and troubleshooting commands to specific learning milestones.
* **How DaemonBoard helps**: Sarah uses the Projects module to link her Kubernetes study notes, tracking her microservices setup tasks on the Kanban board, while using the system metrics dashboard to monitor her local minikube cluster resources.

---

## 4. Functional Requirements

### 🔐 Authentication & Workspace Management (Phase 5)
- User sign-up, login, and token-based session verification (JWT) with secure storage.
- Multi-project workspaces allowing users to isolate notes, tasks, and roadmaps by subject (e.g., "Kubernetes Prep", "Project Alpha CI/CD").

### 📊 Central Dashboard (Phase 6)
- Resource overview widgets displaying CPU, Memory, Disk Space, and Uptime (via Node.js OS monitoring).
- Activity stream showing recent note updates, roadmap milestones achieved, and pending Kanban tasks.

### 🗺️ Interactive Learning Roadmaps (Phase 7)
- Tree/Graph or checklist visualization of roadmap nodes (e.g., Linux Basics -> Bash Scripting -> SSH Keys).
- Markdown-supported node descriptions containing command cheat sheets, study resources, and quizzes.
- Interactive status tracking (Not Started, In Progress, Completed).

### 📋 Kanban Board (Phase 8)
- Classic column lanes (To Do, In Progress, Review, Done) with drag-and-drop card ordering.
- Card details including descriptions, priority levels, checklist subtasks, and links to relevant notes or roadmap nodes.

### 📝 Markdown Notes & Snippets (Phase 9)
- Fully featured Markdown editor with preview mode, syntax highlighting for code blocks, and copyable snippets.
- Global tags/labels classification.
- Document linking (connect notes directly to Kanban tasks or roadmap nodes).

### 🖥️ Admin & System Monitor (Phase 11)
- Live process listing (similar to `top` or `ps`), displaying process ID, memory/CPU consumption, and status.
- Secure, restricted action controls (Start, Stop, Restart processes or services).
- Live logging viewer with filter search.

### 🔍 Global Search (Phase 12)
- Unified search console overlay (CMD/Ctrl+K) performing fuzzy search across notes content, Kanban cards, project meta-information, and roadmaps.

### 🔔 Notifications (Phase 13)
- Real-time socket-based alerts for system status shifts (e.g., local process down, CPU spike) and study task deadlines.

---

## 5. Non-functional Requirements

- **Performance**:
  - API response times under **100ms** for CRUD operations.
  - Dashboards and metric feeds must be throttled/debounced to keep client browser CPU usage below **5%** during active charting.
- **Security**:
  - Encrypted password storage using `bcrypt`.
  - Secure API endpoints with standard route protection middlewares.
  - Sanitized outputs to prevent Cross-Site Scripting (XSS) in markdown previews.
  - Restricted scope for server actions to prevent arbitrary code execution vulnerabilities.
- **Usability (Rich Aesthetics)**:
  - Gorgeous responsive interface leveraging dark-theme styling, glassmorphism UI elements, sleek custom scrollbars, and modern font hierarchy (e.g., Inter/Outfit).
  - Micro-animations and hover transitions for cards, list items, and stats counters.
  - Cross-browser compatibility (Chrome, Edge, Safari, Firefox).
- **Scalability**:
  - Abstracted data layers (using Prisma or Knex) allowing seamless database swapping from local SQLite (for developer setup) to PostgreSQL (production).
  - Decoupled client-server design allowing the frontend to be statically served via CDN while the API runs on containers.

---

## 6. MVP Scope

The Minimum Viable Product (MVP) concentrates on the core workflows required to track, learn, and document:

1. **Authentication**: Basic signup/login and session retention.
2. **Project Workspace**: Creating and switching between distinct project workspaces.
3. **Interactive Roadmaps**: Importing or creating standard checklist-based learning nodes with progress indicators.
4. **Basic Kanban**: Column creation and card movement (CRUD actions for tasks).
5. **Markdown Notes**: Writing notes, rendering rich preview, and attaching them to a project.
6. **Aggregated Dashboard**: A summary page of current progress, showing active tasks, recent notes, and general server uptime.

---

## 7. Future Roadmap

- **Phase 12 (Search)**: Unified workspace-wide search console overlay.
- **Phase 13 (Notifications)**: Real-time warnings regarding process crash detection.
- **Phase 14 (DevOps)**: Docker environment monitoring integration, visual container list, log streaming from specific container IDs.
- **Phase 15 & 16 (Testing & Deployment)**: Automated Kubernetes setups, CI/CD runners validation dashboard.

---

## 8. Feature Priorities (MoSCoW)

```
┌───────────────────────────────────────────┬───────────────────────────────────────────┐
│ MUST HAVE (MVP Core)                      │ SHOULD HAVE (Highly Recommended)          │
│ ───────────────────────────────────────── │ ───────────────────────────────────────── │
│ - User Auth & protected routes            │ - Live server CPU & Memory charts         │
│ - Project Workspaces                      │ - System Process table view               │
│ - Interactive Roadmap checklists          │ - WebSocket metrics updates               │
│ - Kanban board with simple drag/drop      │ - Full-text Search (Ctrl+K overlay)       │
│ - Markdown editor for notes & snippets    │                                           │
├───────────────────────────────────────────┼───────────────────────────────────────────┤
│ COULD HAVE (Delighters)                   │ WON'T HAVE (Out of Scope for initial)     │
│ ───────────────────────────────────────── │ ───────────────────────────────────────── │
│ - Real-time system log analyzer           │ - Multi-tenant team billing               │
│ - AI-generated roadmap curriculum maker   │ - Direct cloud resource provisioning      │
│ - Dark/Light mode theme toggle            │ - Remote SSH shell terminal emulator      │
└───────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 9. Risk Analysis

| Risk | Impact | Probability | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **System commands execution security** | High | Medium | Never run raw command string inputs from the frontend. Use hardcoded, structured system APIs (e.g. process names) and check user permissions before firing actions. |
| **Performance lag during high-rate metrics streaming** | Medium | High | Use WebSockets instead of polling. Limit metrics database writes. Throttle state updates on the frontend to once every 2 seconds. |
| **Database locks on concurrent writes (SQLite)** | Medium | Low | For local runs, configure SQLite in WAL (Write-Ahead Logging) mode. Maintain database abstraction so users can upgrade to PostgreSQL instantly. |

---

## 10. Success Metrics

1. **Productive Interaction Rate**: Active users daily updating notes or dragging Kanban cards.
2. **Roadmap Progress Ratio**: The number of roadmap nodes completed vs. tasks opened, indicating active learning alignment.
3. **Application Load Time**: Initial web load time under **1.5 seconds** on broadband connections.
4. **Backend Resource Impact**: The backend server consumes less than **50MB of RAM** and **1% CPU** during idle monitoring.

---

## 11. Release Plan

- **Release 0.1 (Milestone 1 - Phase 1 to 5)**: Monorepo configuration, API and DB schemas completed, Auth routes live, Sidebar layout designed.
- **Release 0.5 (Milestone 2 - Phase 6 to 10)**: Core learning and task features (Roadmaps, Kanban, Notes, Dashboard) integrated and fully functional.
- **Release 0.8 (Milestone 3 - Phase 11 to 13)**: Monitoring suite, server process controls, full-text search, and alert sockets integrated.
- **Release 1.0 (Milestone 4 - Phase 14 to 17)**: Fully tested (Unit + E2E), Dockerized, deployable cloud configs completed, final API documentation compiled.
