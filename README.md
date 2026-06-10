# Portfolio — Aryan Damai

**Live:** [aryan-backend-dev.vercel.app](https://aryan-backend-dev.vercel.app/)

This portfolio is itself a running system, not a static page. The stats on the
hero section (page views, project clicks, resume downloads, API latency) are
live data flowing through a real backend I built and deployed.

## Architecture

```text
┌─────────────────────────────────┐
│         React + Vite SPA        │
│   Tailwind · typed API client   │
│   fetch with retry + fallback   │
└────────────────┬────────────────┘
                 │  HTTPS / JSON
                 ▼
┌─────────────────────────────────┐
│         Express REST API        │
│  routes → controllers →         │
│        services → queries       │
│  rate limit · validation ·      │
│  central error handler          │
└────────────────┬────────────────┘
                 │  pg connection pool
                 ▼
┌─────────────────────────────────┐
│            PostgreSQL           │
│  contact messages · analytics   │
│  events (views/clicks/resumes)  │
└─────────────────────────────────┘
```

## Design decisions

- **Layered backend** — routes only wire URLs, controllers handle HTTP,
  services hold logic, and query modules own the SQL. Each layer has one job,
  so a change in one place doesn't ripple through the rest.
- **Rate limiting** — the contact endpoint sits behind a sliding-window
  limiter keyed by client IP. Abusive traffic gets a clean `429` instead of
  flooding the database.
- **Fire-and-forget analytics** — page views, project clicks, and resume
  downloads are tracked asynchronously. If a tracking call fails, the user
  never notices; analytics must never break the actual page.
- **Graceful degradation** — the frontend API client retries failed requests
  after a short delay to absorb backend cold starts. If the API stays down,
  the stats panel falls back to an offline state instead of crashing the page.
- **Consistent error contract** — every backend error funnels through one
  middleware that shapes it into the same JSON envelope
  (`{ ok: false, error: "..." }`), so the frontend handles failures in
  exactly one way.
- **Validation at the edge** — incoming payloads are validated before they
  reach business logic or SQL.

## Project structure

```text
├── frontend/                  # React + Vite + Tailwind SPA
│   └── src/
│       ├── app/               # Page and section components
│       │   └── components/    # ProjectCard, SystemStats, ContactForm, ...
│       ├── lib/               # API client + fetch-with-retry helper
│       └── styles/            # Tailwind setup and theme
└── backend/                   # Express REST API
    └── src/
        ├── routes/            # URL wiring only
        ├── controllers/       # HTTP request/response handling
        ├── services/          # Business logic
        ├── db/                # SQL queries (pg connection pool)
        ├── middleware/        # Rate limiting, error handler
        ├── validators/        # Input validation at the boundary
        └── config/            # Env and database configuration
```

## API endpoints

| Method | Endpoint                 | Purpose                                  |
| ------ | ------------------------ | ---------------------------------------- |
| GET    | `/api/health`            | Health check                             |
| GET    | `/api/stats`             | Live portfolio stats for the hero panel  |
| POST   | `/api/contact`           | Contact form submission (rate limited)   |
| POST   | `/track/page-view`       | Analytics: page view                     |
| POST   | `/track/project-click`   | Analytics: project link click            |
| POST   | `/track/resume-download` | Analytics: resume download               |

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express 5, PostgreSQL (`pg`)
- **Hosting:** Vercel (frontend), free-tier Node hosting (backend)

## Running locally

### Backend

```bash
cd backend
npm install
# create a .env with at least:
#   DATABASE_URL=postgres://...
#   FRONTEND_URL=http://localhost:5173
npm run dev      # starts on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

The frontend reads `VITE_API_BASE_URL` (defaults to `http://localhost:4000`).
