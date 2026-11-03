# Architecture

The root React SPA and Hono Worker form one application. Vite bundles the UI and Worker; Wrangler binds D1 as `DB`. API calls use the same origin. There is no Express server, MongoDB database, vector database, model training, or file-storage feature in the active application.

## Request lifecycle

1. React collects input in controlled state.
2. `apiRequest` sends JSON and surfaces API errors.
3. Hono limits request bodies and rejects cross-origin browser requests.
4. `requireUser` obtains the authenticated identity. The explicit loopback demo requires its session cookie; absent production credentials fail closed.
5. Zod validates input; prepared statements bind values and scope records to the user.
6. The response refreshes the relevant UI. Daily toggles refresh both entries and statistics.

The production authentication provider's internal OAuth validation is delegated to its SDK/service. Local demo authentication is intentionally not a real identity system.

## Domain model

A habit is a definition; a habit entry is its date-specific boolean check-in. Frequency is deliberately one check-in per day in this version. Bad-habit completion means the user met the avoidance goal, not that the bad action occurred.

Journal entries store text, sentiment, feedback and the analysis source. The UI lists the latest ten. Existing community tables are reserved for future work; no participation workflow is exposed.

Migration `2.sql` keeps the highest-ID daily row when duplicates exist, creates uniqueness and composite lookup indexes, adds an analysis-source column, and normalizes legacy frequency targets to the supported single daily check-in. Back up an existing remote database before applying it. Existing entries are labeled `basic` because their original provider cannot be verified.

## Metrics

- UTC defines date keys and week boundaries (Monday start).
- `completedToday` counts completed check-ins belonging to active habits owned by the user.
- Activity streak: at least one completed check-in on an active habit on each consecutive day.
- If today has no completion, calculation starts yesterday; a missing yesterday breaks the streak.
- Longest streak scans all qualifying dates independently.
- Archived habits remain stored, but are excluded from all current metrics and charts.
- Weekly denominators use the current active habit count; they are not historical schedule snapshots.
- Monthly aggregation returns elapsed days only. Missing check-ins become zero; HTTP failures remain errors.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | App and integration status, without secrets |
| GET | `/api/oauth/google/redirect_url` | Begin production or local-demo sign-in |
| POST | `/api/sessions` | Exchange authorization code and set cookie |
| GET | `/api/logout` | SDK-compatible session logout |
| GET | `/api/users/me` | Current user |
| GET / POST | `/api/habits` | List / create |
| PUT / DELETE | `/api/habits/:id` | Edit / archive owned habit |
| GET / POST | `/api/habit-entries` | Read a date / upsert an owned daily check-in |
| GET | `/api/dashboard/stats` | Counts, activity streaks and weekly progress |
| GET | `/api/analytics/monthly` | Aggregated current-month completions |
| GET | `/api/ai/daily-insight` | Curated encouragement, not generated AI |
| GET / POST | `/api/journal` | Latest reflections / save analyzed reflection |
| POST | `/api/ai/coach/chat` | Contextual coach or labeled fallback |

All routes except health and sign-in/session/logout require authentication. Invalid input returns 400; missing sessions return 401; unavailable auth configuration returns 503; inaccessible habits return 404.

## AI boundaries

The server fetches the current user's context. The browser sends only bounded conversation history and the current message. The current integration uses `gpt-4o-mini` through Chat Completions, with a 15-second timeout. Journal output is schema validated. No-key and provider-failure paths use explicit basic/fallback modes. No personal data is placed in the system-role instruction text.

The model does not have persistent memory; recent context is provided on each request. Chat history exists in component state. Keyword sentiment is a simple heuristic and cannot reliably interpret negation or emotional nuance. AI coaching is general guidance, not clinical assessment.

## Remaining production work

Distributed rate limits and AI spend limits, stronger provider-abuse controls, data retention/deletion, paginated journal history, foreign-key migration planning, user-specific timezone scheduling, broader browser accessibility coverage and real-provider integration tests remain future work. The local SQLite API adapter verifies application behavior, while the real local Worker smoke check verifies core D1 execution separately.
