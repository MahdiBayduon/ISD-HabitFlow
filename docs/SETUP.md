# Setup

## Local development

1. Install Node 22.13+ and run `npm ci` at the root.
2. Copy `.dev.vars.example` to `.dev.vars` and keep `DEMO_MODE=true` for loopback-only testing.
3. Run `npm run db:migrate` to create local D1 tables and apply the constraint upgrade.
4. Run `npm run dev` and open Vite's localhost URL.
5. Select Get Started, create a habit, check it off, write a journal entry, and open the coach.

The demo uses one local identity. Its sign-in flow uses a demo callback/session cookie; it does not validate a real Google identity. Restarting the app preserves local D1 data under `.wrangler/`. Removing that directory resets local data.

`npm run typecheck` generates `worker-configuration.d.ts`; the generated file is intentionally ignored. Run `npm run check` before submitting changes. `npm run build` also generates the necessary Worker types.

## Optional AI

Set `OPENAI_API_KEY` in `.dev.vars`, restart development, then submit a journal reflection or chat message. Without a key, basic feedback and fallback coaching remain available and labeled. AI requests send habit information and recent journal content to the provider; use synthetic data during a public demo.

## Prepare a deployment

Deployment is not performed automatically.

1. Configure your Cloudflare account and create your D1 database with Wrangler.
2. Replace `database_name` and `database_id` in `wrangler.json` with your own resource details. The checked-in ID is inherited from the original project; do not assume access to it.
3. Configure the Mocha Users Service for your deployed app and its callback route `/auth/callback`. This requires access to that external service; the SDK alone does not provision it.
4. Add `MOCHA_USERS_SERVICE_API_URL` and `MOCHA_USERS_SERVICE_API_KEY` as Worker secrets. Add `OPENAI_API_KEY` only if enabling AI.
5. Leave `DEMO_MODE` unset in production. The loopback check blocks demo authentication on deployed hostnames even if the flag is accidentally present.
6. Back up existing data and review `migrations/2.sql`: it retains the latest row for each duplicate daily entry before creating a unique index.
7. Apply remote migrations intentionally with `npm run db:migrate:remote`, then build and deploy using your normal Wrangler workflow.
8. Test real OAuth sign-in/logout, ownership isolation, check-ins and provider failure behavior on the deployed origin.

Never run remote migration/deployment commands merely to test a local setup. No real credentials belong in Git. Before real-user operation, add distributed rate limits, spend controls, backup policies and privacy/retention procedures.
