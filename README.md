# Overclock — Productivity App

A full-stack productivity app with user accounts and a Pomodoro-style focus timer, built with React (Vite) on the frontend and Express + PostgreSQL on the backend.

## Features

- **User authentication** — sign up and log in with a hashed password (bcrypt), stored in PostgreSQL
- **Pomodoro timer** — start, pause, and reset a countdown timer to structure focus sessions
- **Task & session schema** — database tables for tasks and work sessions are in place to support task-linked time tracking (not yet wired to the UI)

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router (`HashRouter`)

**Backend**
- Node.js + Express 5
- PostgreSQL (via `pg`)
- bcrypt for password hashing
- dotenv for environment config

**Infra**
- Docker + Docker Compose (local/self-hosted)
- Railway (backend) + Vercel (frontend) for cloud deployment

## Project Structure

```
productivity-app/
├── frontend/
│   ├── src/
│   │   ├── app/          # App entry & routing
│   │   ├── pages/        # Login, Home
│   │   ├── features/     # PomodoroTimer
│   │   ├── components/   # Header, Footer, Button
│   │   ├── utils/        # Helpers (e.g. time formatting)
│   │   └── styles/       # Per-component CSS
│   ├── Dockerfile
│   └── vercel.json
├── backend/
│   ├── server.js         # Express entry point
│   ├── routes/           # API routes (users)
│   ├── database/         # PostgreSQL pool connection
│   ├── schema.sql        # Database schema
│   ├── Dockerfile
│   └── railway.json
└── docker-compose.yml
```

## Local Development

### Prerequisites

- Node.js
- PostgreSQL

### 1. Clone the repo

```bash
git clone https://github.com/danischs/productivity-app.git
cd productivity-app
```

### 2. Set up the database

Create a PostgreSQL database, then run the schema:

```bash
psql -d your_database_name -f backend/schema.sql
```

### 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your DB credentials
npm start
```

The API runs on `http://localhost:3000`.

### 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:3000
npm run dev
```

The app runs on `http://localhost:5173`.

## Running with Docker

The whole stack (Postgres + backend + frontend) can be run with one command from the repo root:

```bash
docker compose up --build
```

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:3000`
- Postgres → `localhost:5432` (schema is loaded automatically on first boot)

## Deploying to the Cloud (Railway + Vercel)

### Backend → Railway

1. Create a new Railway project and add a **PostgreSQL** plugin.
2. Add a second service pointing at the `backend/` directory of this repo (Railway auto-detects Node via Nixpacks; `railway.json` is included).
3. Set environment variables on the backend service:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — from the Railway Postgres plugin's connection info
   - `CLIENT_ORIGIN` — your Vercel frontend URL (set after step below)
4. Run `backend/schema.sql` against the Railway Postgres instance (e.g. via Railway's query console or `psql` with the provided connection string).
5. Note the public backend URL Railway assigns (e.g. `https://your-app.up.railway.app`).

### Frontend → Vercel

1. Import this repo into Vercel, setting the **root directory** to `frontend/`.
2. Vercel will pick up `vercel.json` automatically (Vite build, `dist/` output).
3. Set the environment variable `VITE_API_URL` to your Railway backend URL from above.
4. Deploy. Once live, copy the Vercel URL into `CLIENT_ORIGIN` on the Railway backend and redeploy the backend so CORS allows it.

## Environment Variables

**backend/.env**

| Variable        | Description                          |
|-----------------|---------------------------------------|
| `DB_HOST`       | Postgres host                         |
| `DB_PORT`       | Postgres port                         |
| `DB_USER`       | Postgres user                         |
| `DB_PASSWORD`   | Postgres password                     |
| `DB_NAME`       | Postgres database name                |
| `PORT`          | Port the server listens on (default 3000) |
| `CLIENT_ORIGIN` | Frontend URL, for CORS                |

**frontend/.env**

| Variable        | Description             |
|-----------------|--------------------------|
| `VITE_API_URL`  | Base URL of the backend API |

## API Endpoints

| Method | Endpoint         | Description                  |
|--------|------------------|-------------------------------|
| GET    | `/health`        | Health check                  |
| POST   | `/users/signup`  | Create a new user account     |
| POST   | `/users/login`   | Authenticate and log in       |

## Database Schema

- **users** — id, username, email, password hash, created_at
- **tasks** — id, user_id, title, status (`todo` / `doing` / `done`)
- **work_sessions** — id, user_id, task_id, session type (`work` / `break`), start/end times, duration

## Roadmap

- [ ] Persist Pomodoro sessions to `work_sessions`
- [ ] Task creation/management UI, linked to `tasks`
- [ ] Session-based auth (tokens/cookies) instead of raw login checks

## License

ISC
