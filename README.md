# HabitFlow

HabitFlow is a habit tracking project with a dashboard, journal, analytics, community views, and an AI coach interface.

## Repository layout

- Root app: React, TypeScript, Vite, Tailwind CSS, Hono, and Cloudflare configuration.
- `frontend/`: a separate React, TypeScript, Vite UI with React Router, Axios, and Recharts.
- `backend/`: a separate Express API using an in-memory SQLite database.

## Run locally

For the root app:

```bash
npm install
npm run dev
```

For the separate frontend and backend, run `npm install` in each directory, then `npm run dev` in each. The backend defaults to port 5000.

## Current limitations

The Express backend uses simplified demo authentication and an in-memory database, so data resets when it restarts. The AI coach interface and integrations should be evaluated as project features rather than a production service. Do not use the demo authentication for real accounts.
