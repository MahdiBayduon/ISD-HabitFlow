# HabitFlow - Project and HR Presentation Report

Prepared for Mahdi Baydoun | 3 November 2026

## Project summary

HabitFlow is a full-stack habit-tracking portfolio prototype. It brings habit definitions, daily completion records, progress charts, journal reflection and optional contextual AI coaching into one workflow. The submission uses one canonical React/TypeScript application and Hono API. The earlier separate Express/React demo is retired from the active repository and remains in Git history.

The strongest value is the connected workflow: define a manageable habit, record a daily check-in, review real progress, reflect in the journal and ask the coach for a practical next step. Present this demonstrated workflow before discussing planned extensions.

## Technology and responsibilities

| Technology | Role in this implementation |
| --- | --- |
| React 19 | Reusable components, controlled forms and state-driven screens |
| TypeScript 5 | Static types across client, API and shared contracts |
| React Router 7 | Client navigation, nested layout and protected screens |
| Tailwind CSS 3 | Responsive interface and class-based dark mode |
| Vite 7 | Development server, bundling and lazy-loaded page chunks |
| Hono 4 | Worker HTTP routes, middleware, validation/error responses |
| Cloudflare Workers | Server runtime for the API and static app delivery |
| Cloudflare D1 / SQLite | Relational habit, completion and journal storage |
| Zod 3 | Runtime input validation and model-output validation |
| Recharts 3 | Charts derived from stored completion data |
| date-fns 4 | Date presentation in the frontend |
| Mocha Users Service SDK | External production OAuth/session integration |
| OpenAI Chat Completions | Optional journal analysis and contextual coaching; configured model is gpt-4o-mini |
| Wrangler | Worker types, local D1 migrations and deployment tooling |
| Node.js test runner + esbuild | Bundled API tests, SQLite fixtures and progress regression tests |
| GitHub Actions | Reproducible installation, checks, build and local Worker/D1 smoke workflow |

This version does not use MongoDB, Express, password/JWT authentication, a vector database, fine-tuning, or autonomous AI agents. Describe the code being submitted rather than a different HabitFlow version.

## Architecture and data flow

The browser runs a React SPA and calls same-origin `/api` routes. Hono obtains an authenticated identity, validates requests with Zod, performs ownership-scoped prepared SQL operations and returns JSON. Optional AI calls originate from the server so the API key is not exposed to the browser.

`src/react-app/` contains the UI. `src/worker/` contains authentication, routes, progress logic and AI helpers. `src/shared/types.ts` supplies schemas/types. `migrations/` defines and upgrades D1. `tests/` covers API behavior and progress rules.

Habits are long-lived definitions. Habit entries are date-specific check-ins. A unique `(user_id, habit_id, date)` key and SQL upsert make retries update one daily record. Journal entries store text, feedback, sentiment and the analysis source. Community-related tables remain reserved for planned extensions.

## What is implemented

- Create, edit and archive habits; check-ins must reference an active habit owned by the authenticated user.
- One boolean check-in per habit per UTC day. For a habit being broken, completion means meeting an avoidance goal.
- Current and longest activity streaks calculated independently. If today is incomplete, yesterday's streak remains current until today ends.
- Dashboard refresh after completion and a single aggregated monthly analytics request.
- Journal creation and the latest ten entries. Basic keyword feedback works without an AI key; configured AI analysis validates the model response.
- Coach context retrieved server-side from owned habits and recent journal excerpts; bounded history, provider timeout and labeled fallback guidance.
- Browser-persisted theme, lazy-loaded pages and direct SPA URL handling.
- Explicit local demo sessions; missing production auth settings fail closed.

## Feature boundaries

Community participation, leaderboards, notification delivery, profile editing, account deletion and import/export are planned. The app does not predict future success rates. Daily encouragement and starter suggestions are curated content rather than generated AI. Chat is not persisted across page sessions. Keyword sentiment is a basic heuristic, not clinical analysis.

All daily boundaries use UTC. Archiving excludes the habit's entries from current charts and streaks. Weekly denominators use today's active habit count rather than historical schedule snapshots. The journal has no pagination beyond its latest ten entries.

Production operation still requires configured real authentication, an owned D1 database, provider testing, distributed rate/spend limits and privacy/retention/backup policies. Local functionality is available without Google or OpenAI credentials. No deployment or remote database migration is needed to run the local demo.

## Run the project

Install Node.js 22.13 or newer; Node 24 is the tested recommendation. Open a terminal outside any existing project folder:

```bash
git clone https://github.com/MahdiBayduon/ISD-HabitFlow.git
cd ISD-HabitFlow
npm run setup
npm start
```

If you already have a clone, save or commit your local work before updating it. Use `git switch main` and `git pull --ff-only`, then run setup again. Do not discard local changes to force an update.

`setup` installs locked dependencies, creates the local-demo `.dev.vars` only if absent, migrates local D1 and checks TypeScript. It preserves existing configuration. Open the localhost URL printed by Vite and select Get Started. Local data persists under `.wrangler/`.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd run setup` and `npm.cmd start`, or use Command Prompt. Stop the development server with Ctrl+C. A different port may be printed when the usual port is occupied.

No API key is required for local tracking, analytics, journal storage or fallback coaching. For actual AI responses, place your own `OPENAI_API_KEY` in `.dev.vars` and restart. Never commit secrets. Real production Google sign-in requires separate Mocha service configuration.

## Validation and limits of verification

The reconstruction passed TypeScript, ESLint, 12 regression tests, Worker/client production builds, local migrations and a smoke test against the real local Worker and D1. GitHub CI also passed for the consolidation. The setup command, final type/lint/test/build checks and local Worker/D1 smoke test also passed locally for the setup/error-handling follow-up.

The regression suite covers missing auth configuration, unauthorized habit references, concurrent check-ins, archived metrics, invalid dates, migration deduplication, trusted AI context, malformed AI output and streak edge cases. Live Google OAuth and real OpenAI calls require credentials and are not claimed as verified. The user's Windows machine has not been accessed; setup uses cross-platform Node APIs but cannot guarantee every device/network condition.

## Present it to HR

Start with the user problem and a working result. HR usually needs to understand what the project demonstrates about your ability to learn, organize work, explain decisions and finish a feature. Keep framework detail to one short sentence unless asked.

### Suggested 45-second introduction

"I'm Mahdi Baydoun, a developer focused on React and TypeScript. HabitFlow is a full-stack habit-tracking project that connects daily check-ins, progress charts, journaling and contextual coaching. The main workflow lets a user create a habit, record progress and reflect on what helped or got in the way. The submission uses a React frontend, a Hono API and a SQL database. It demonstrates how I approach interface development, API integration, data modeling and testing. I can walk you through a complete feature and explain both its design decisions and its current limitations."

Adapt claims about your role to your actual contribution. The repository includes Mocha scaffolding, an external authentication SDK and assisted reconstruction. Identify what you personally designed, implemented, debugged or learned; do not describe every generated line as hand-written.

### Five-minute demonstration

1. Explain the problem in 20-30 seconds: connecting repeated actions with feedback and reflection.
2. Create a small habit, edit it, then mark today's completion. Show the dashboard update.
3. Open analytics and explain that counts come from stored entries, not sample predictions.
4. Save a synthetic journal reflection. Identify whether the result is basic or AI-generated.
5. Ask the coach for one practical next step. Explain that server-held context personalizes the request and that fallback mode is clearly labeled.
6. Close with one engineering example: ownership checks plus the unique daily key prevent cross-user writes and duplicate check-ins. Mention tests and one planned improvement.

Use synthetic data, rehearse the exact local commands and avoid spending the demo on incomplete community features. Prepare one concrete challenge you personally solved using a situation-action-result structure.

## Questions and honest answers

| HR question | Suggested direction |
| --- | --- |
| Why this project? | It connects interface work with API/data decisions through a clear daily user workflow. Add your real motivation. |
| What was your role? | Name specific work you actually performed and distinguish platform/generated/assisted parts. |
| What is the strongest feature? | The end-to-end habit workflow and contextual journal/coach integration, backed by validation and tests. |
| What was a technical challenge? | Use an actual example you understand: duplicate daily entries, ownership isolation, or keeping dashboard metrics consistent. Explain the cause, change and verification. |
| Is the AI custom-trained? | No. The server sends relevant context to an external model; no training or vector search is implemented. |
| What is unfinished? | Community participation and account/notification workflows; production infrastructure and abuse controls also remain. |
| What would you improve next? | Choose one practical priority, such as journal pagination, user timezones or production rate/spend limits. |
| Why should we consider you? | Relate the demonstrated skills to the internship: building a coherent interface, tracing requests, debugging data flow and explaining tradeoffs. Avoid unsupported impact numbers. |

## Technical questions to rehearse

Be ready to explain React state/effects/context, protected routes versus backend authorization, TypeScript versus runtime validation, prepared SQL parameters, soft deletion, unique constraints/upserts, streak rules, local versus real authentication, server-side secrets and AI fallbacks. Trace one feature from the click through HTTP, validation, identity, SQL, response and UI refresh.

## Sources

Repository: https://github.com/MahdiBayduon/ISD-HabitFlow

Reconstruction: https://github.com/MahdiBayduon/ISD-HabitFlow/pull/1

Code-level detail: `docs/ARCHITECTURE.md`, `docs/SETUP.md` and `docs/INTERVIEW_GUIDE.md`. This report describes the consolidated version, not the retired Express demo.
