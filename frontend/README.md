# NexusAI Landing Page

A production-ready, fully responsive SaaS landing page with **React 18 + Vite + Tailwind CSS** frontend, **Node.js + Express + SQLite** backend, JWT auth, live crypto market data, a Jira-style Projects/Tickets manager, and real AI-generated task insights (Groq).

---

## Quick Start

### 1. Backend (Port 5000)

```bash
cd server
npm install
cp .env.example .env   # then fill in JWT_SECRET (and optionally GROQ_API_KEY)
npm run dev
```

Server runs at `http://localhost:5000`

> `GROQ_API_KEY` is optional — get a free one at [console.groq.com/keys](https://console.groq.com/keys) to enable real LLM-generated insights on the Dashboard. Without it, the AI Insights panel still works using a simple rule-based fallback.

### 2. Frontend (Port 5173)

In a new terminal:

```bash
npm install
npm run dev
```

Site opens at `http://localhost:5173`

---

## Testing

This project has three layers of automated tests: frontend component tests, backend API tests, and an end-to-end (E2E) flow test.

### 1. Frontend tests (Vitest + React Testing Library)

```bash
npm install         # from the project root, if not already done
npm run test        # run once
npm run test:watch  # watch mode while developing
```

Covers: `TaskCard` rendering, `TaskModal` form validation + submit interaction, `Login` form validation, and `DonutChart` / `BarChart` rendering logic — 17 tests across 5 files.

### 2. Backend tests (Vitest + Supertest)

```bash
cd server
npm install          # if not already done
npm run test         # run once
npm run test:watch   # watch mode
```

Tests run against an isolated throwaway SQLite database (`server/tests/test-tasks.db`, auto-created and reset on every run) — your real `tasks.db` is never touched. Covers the Tasks API (create/read/update/delete, stats aggregation, validation failures) and the Auth API (signup/login happy paths + failure cases) — 13 tests.

### 3. End-to-end test (Playwright)

```bash
npm install
npx playwright install chromium   # one-time browser download
npm run test:e2e
```

This spins up **both** the backend (`:5000`) and frontend (`:5173`) dev servers automatically, then drives a real browser through: **sign up → land on the protected dashboard → create a project → open its board → create a ticket → confirm it appears**, plus a negative case for invalid login credentials.

> Note: `npx playwright install chromium` needs to reach `cdn.playwright.dev` to download the browser binary — if you're behind a restrictive firewall/proxy, allow that host first.

### Running everything

```bash
npm run test && (cd server && npm run test) && npx playwright test
```

---

## Features

### Public Landing Page (kept light — no data-heavy sections)
- Dark theme with blue gradients
- Responsive navbar with mobile drawer
- Animated hero, feature cards, "How It Works", pricing, testimonials, FAQ
- Demo request form (public, connects to the backend)

> Market data and the Task/Project manager used to live on this public page. They've been moved behind login (see below) so the first page load stays light — nothing extra to fetch or render until you actually sign in.

### Auth
- Email/password signup & login (JWT-based), protected routes via `<ProtectedRoute>`
- Avatar upload with drag & drop, preview, and progress

### Dashboard (post-login)
- Task summary + market overview widgets
- **AI Task Insights** — a real LLM-generated summary of what to prioritize next (Groq API, `llama-3.3-70b-versatile`). Falls back to a simple rule-based summary if no `GROQ_API_KEY` is configured, so it never breaks.
- Productivity analytics: status/priority/timeline charts, server-side aggregated

### Projects & Tickets (Jira-style, post-login)
- Create a **Project** (auto-derives a short key from its name, e.g. "Marketing Site" → `MARKET`)
- Each project has its own ticket board — tickets get sequential, human-readable IDs like `MARKET-1`, `MARKET-2`
- Full CRUD on tickets: create/edit/delete, search, filter by status/priority, sort, file attachments (any type, 10MB max, drag & drop)
- Deleting a project cascades: its tickets and their attached files are cleaned up too

### Live Market Insights (CoinGecko API, post-login)
- Real-time top 50 cryptocurrency data, search, refresh, skeleton/error states

---

## Tech Stack

### Frontend
- React 18, Vite, Tailwind CSS, React Router
- Vitest + React Testing Library (unit tests), Playwright (E2E)

### Backend
- Node.js, Express.js, SQLite3
- JWT auth (jsonwebtoken + bcryptjs), Multer for uploads
- Vitest + Supertest (API tests)
- Groq API for AI insights (optional — graceful fallback without a key)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/avatar` | Upload avatar |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get a project |
| POST | `/api/projects` | Create a project |
| DELETE | `/api/projects/:id` | Delete a project (cascades its tickets) |
| GET | `/api/tasks?projectId=` | List tickets (optionally scoped to a project) |
| GET | `/api/tasks/stats` | Aggregated stats for the dashboard charts |
| GET | `/api/tasks/:id` | Get a single ticket |
| POST | `/api/tasks` | Create a ticket (pass `projectId` to get a `PROJ-N` key) |
| PUT | `/api/tasks/:id` | Update a ticket |
| DELETE | `/api/tasks/:id` | Delete a ticket |
| POST | `/api/tasks/:id/attachment` | Upload a file attachment |
| DELETE | `/api/tasks/:id/attachment` | Remove a file attachment |
| GET | `/api/ai/insights?projectId=` | AI-generated (or fallback) task summary |
| POST | `/api/demo-requests` | Submit a demo request |

### Ticket (task) Schema
```json
{
  "id": "uuid",
  "title": "string (required, max 200)",
  "description": "string",
  "status": "Pending | In Progress | Completed",
  "priority": "Low | Medium | High",
  "createdAt": "ISO 8601 timestamp",
  "projectId": "uuid | null",
  "ticketKey": "string | null (e.g. MARKET-1)",
  "attachmentPath": "string | null"
}
```

---

## Project Structure

```
nexusai-landing/
├── index.html
├── package.json                 # Frontend dependencies
├── vite.config.js               # Includes Vitest test config
├── playwright.config.js         # E2E test config
├── e2e/
│   └── tasks-flow.spec.js       # Signup → create project → create ticket
├── README.md
├── .gitignore
├── src/
│   ├── main.jsx                 # React entry (Auth/Task/Project/Market/Toast providers)
│   ├── index.css
│   ├── App.jsx                  # Public landing page + all routes
│   ├── test/setup.js            # Vitest + jest-dom setup
│   ├── services/
│   │   └── api.js               # taskApi, projectApi, aiApi, authApi clients
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── TaskContext.jsx      # Global task list (Dashboard-wide stats)
│   │   ├── ProjectContext.jsx   # Projects list
│   │   ├── MarketContext.jsx
│   │   └── ToastContext.jsx
│   ├── components/
│   │   ├── auth/                # Login, Signup, ProtectedRoute
│   │   ├── charts/               # DonutChart, BarChart, LineChart
│   │   ├── AIInsightsPanel.jsx  # Real Groq-powered dashboard insight
│   │   ├── ProjectModal.jsx     # Create-project form
│   │   ├── TaskModal.jsx        # Create/edit ticket form
│   │   ├── TaskCard.jsx         # Ticket card (shows PROJ-N key badge)
│   │   ├── TaskAttachment.jsx   # Drag & drop file attachment
│   │   ├── DeleteConfirmModal.jsx # Generic — reused for tasks & projects
│   │   └── ...                  # MarketSection, AnalyticsSection, etc.
│   └── pages/
│       ├── Dashboard.jsx        # Post-login hub (AI insights + analytics)
│       ├── ProjectsPage.jsx     # Project list + create/delete
│       ├── ProjectBoardPage.jsx # Jira-style ticket board for one project
│       └── MarketPage.jsx       # Market data, now behind login
└── server/
    ├── package.json
    ├── app.js                   # Express app (exported for tests)
    ├── server.js                # Boots app.js on PORT
    ├── vitest.config.js
    ├── tests/
    │   ├── setup.js             # Isolated test DB
    │   ├── tasks.test.js
    │   └── projects.test.js
    ├── db/database.js
    ├── models/
    │   ├── TaskModel.js
    │   └── ProjectModel.js
    ├── controllers/
    │   ├── taskController.js
    │   ├── projectController.js
    │   ├── aiController.js      # Groq-powered /api/ai/insights
    │   ├── authController.js
    │   └── demoRequestController.js
    ├── routes/
    └── middleware/
        ├── validation.js        # validateTask, validateProject
        ├── upload.js
        └── requireAuth.js
```

---

## Responsive Design

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | 1 column, hamburger menu |
| Tablet | ≥ 640px | 2 columns |
| Laptop | ≥ 1024px | 3 columns, desktop nav |
| Desktop | ≥ 1280px | 4 columns for crypto cards |

---

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Upload dist/ folder
```

### Backend (Any Node.js host)
```bash
cd server
npm install
npm start
```

---

## License

MIT License
