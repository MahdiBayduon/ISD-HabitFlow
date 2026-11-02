# HabitFlow

A full-stack habit tracker that connects daily actions with reflection and contextual coaching.

**React 19 · TypeScript · Hono · Cloudflare Workers · D1 (SQLite) · Tailwind CSS · OpenAI**

HabitFlow demonstrates a complete request path: a controlled React form sends validated data to an authenticated API, SQL stores daily check-ins, charts summarize progress, and an optional AI integration uses the user's habits and journal context for coaching.

## What you can do

- Create, edit and archive habits you want to build or break.
- Record one check-in per habit per UTC day. For a habit you are breaking, success means meeting your avoidance goal.
- View completion totals, current/longest activity streaks and monthly charts from stored data.
- Write journal reflections and view the latest ten, with clearly labeled basic or AI feedback.
- Ask a contextual coach for practical next steps. AI responses and fallback guidance are distinguished.
- Switch between light and dark themes, persisted on the current browser.

The Community page is a roadmap preview. Group participation, leaderboards, notifications, profile editing, account deletion and import/export are not implemented. There are no predictive models or invented performance statistics in the main experience.

## Quick start: local demo

Requires **Node.js 22.13+** (Node 24 recommended for the tested workflow) and npm.

```bash
npm ci
```

Copy `.dev.vars.example` to `.dev.vars` in the repository root. On macOS/Linux:

```bash
cp .dev.vars.example .dev.vars
```

PowerShell:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Then:

```bash
npm run db:migrate
npm run dev
```

Open the local URL printed by Vite and select **Get Started**. With `DEMO_MODE=true`, the local callback creates a demo session. Local D1 data persists in `.wrangler/` between restarts.

**Demo authentication is restricted to localhost/loopback and requires an explicit flag and sign-in cookie.** A deployed hostname never gets demo authentication. Missing production authentication configuration returns an error instead of admitting a shared user. Do not expose the local demo through a tunnel or use it for real personal data.

Without an OpenAI key, the complete habit/journal workflow still works: journal feedback uses a basic word heuristic and the coach returns labeled general guidance.

## Optional integrations

For local AI, set `OPENAI_API_KEY` in `.dev.vars`. Never prefix a secret with `VITE_` or commit `.dev.vars`.

Production sign-in uses the existing Mocha Users Service integration and requires both `MOCHA_USERS_SERVICE_API_URL` and `MOCHA_USERS_SERVICE_API_KEY`. Creating/configuring that external service is separate from cloning this repository. The application does not implement its own password/JWT authentication.

Before deployment, create your own D1 database, update the database name/ID in `wrangler.json`, configure OAuth for the deployed origin through your authentication provider, set Worker secrets, and apply migrations deliberately. See [setup](docs/SETUP.md).

## One application, one entry point

| Location | Responsibility |
| --- | --- |
| `src/react-app/` | React pages, navigation, forms, hooks and theme |
| `src/worker/index.ts` | Hono endpoints and ownership-scoped SQL |
| `src/worker/auth.ts` | Real authentication or explicit local demo sessions |
| `src/worker/lib/` | Progress calculation and AI integration helpers |
| `src/shared/types.ts` | Zod request schemas and inferred types |
| `migrations/` | D1 schema and incremental data constraints |
| `tests/` | API, migration and streak regression tests |

The earlier standalone `frontend/` and in-memory Express `backend/` were retired from the active tree. They remain recoverable in Git history. The fuller root application is the canonical implementation; there is one dependency installation and one development command.

## Engineering decisions

- **Ownership at the API boundary:** habit reads/mutations and check-ins use authenticated identity, never browser-supplied ownership.
- **Idempotent daily writes:** a unique `(user_id, habit_id, date)` index and SQL upsert prevent duplicate check-ins.
- **Consistent metrics:** active habits determine dashboard counts, charts and activity streaks. Archiving excludes that habit's history from these metrics.
- **Defined dates:** all daily boundaries use UTC. A current streak can end yesterday until today ends. Historical best streak is calculated independently.
- **Efficient analytics:** monthly data is aggregated in one SQL query instead of one HTTP request per day.
- **Honest AI behavior:** server-held secrets, server-fetched personal context, bounded history, timeouts, output validation and labeled fallbacks.

## Validation

```bash
npm run check
npm run build
```

`check` generates Worker types, runs TypeScript and ESLint, executes regression tests, and builds the app. API tests exercise the real Hono routes with an in-memory SQLite adapter. They do not substitute for live OAuth/OpenAI tests or testing deployed D1.

After local setup, `npm run test:smoke` also verifies the real local Worker and D1 request path. CI runs both sets of checks. The repository is a portfolio prototype: production use still requires provider setup, load/security testing, AI cost controls, backup/retention policies and user-specific timezones.

## Project walkthrough

- [Architecture and API](docs/ARCHITECTURE.md)
- [Setup and deployment preparation](docs/SETUP.md)
- [Five-minute demo and interview guide](docs/INTERVIEW_GUIDE.md)

## Attribution and authorship

This repository retains Mocha-generated scaffolding and its authentication SDK. External libraries and platform code belong to their respective authors. Describe personal contributions specifically when presenting the project; do not represent generated scaffolding as entirely hand-written. The consolidation, fixes and regression tests are documented in the repository history.
