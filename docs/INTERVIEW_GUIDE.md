# HabitFlow demo and interview guide

## Five-minute walkthrough

1. **Purpose (30 seconds):** Daily habits are easier to understand when actions, reflection and feedback share one workflow. Explain the React/TypeScript + Hono + D1 architecture.
2. **Habit workflow (60 seconds):** Create a small habit, edit its description, then complete today's check-in. Point out that the dashboard statistics refresh. Explain ownership-scoped SQL and atomic upsert.
3. **Progress (45 seconds):** Open analytics. Explain real stored completion counts, UTC dates, activity streak rules and the independent longest streak. Do not claim predictive analytics.
4. **Journal (45 seconds):** Save a synthetic reflection. Explain basic feedback versus optional AI analysis and how the source is labeled.
5. **Coach (45 seconds):** Ask for a manageable next step. Explain server-fetched personal context, bounded history and fallback behavior. Do not claim training or persistent memory.
6. **Engineering (45 seconds):** Show tests, schema validation, database uniqueness and the architecture document. Describe one tradeoff and a concrete next improvement.
7. **Scope (30 seconds):** Community is a roadmap preview. Explain why one complete, understandable workflow is the submission focus.

## Questions to rehearse

| Question | Code-specific explanation |
| --- | --- |
| Why separate habits and entries? | Definitions persist while daily entries preserve history for charts and streaks. |
| How are users isolated? | Session middleware supplies identity and SQL checks owner IDs, including the referenced habit before completion. |
| Why an upsert? | A unique daily key makes retries and concurrent requests update one row instead of creating duplicates. |
| What does deleting a habit do? | Archives it with `is_active=0`; stored history remains but current analytics exclude it. |
| Why Zod as well as TypeScript? | TypeScript cannot validate untrusted JSON at runtime. Zod validates requests and model analysis. |
| How is AI personalized? | The server reads owned habits and recent journal excerpts and sends bounded context with the current message. |
| Is this RAG or model training? | No. It is prompt-based contextual integration. |
| How does the demo differ from production? | Explicit localhost-only shared identity versus real provider session validation; missing production config fails closed. |
| Why one app now? | The old Express demo lacked the fuller API and duplicated the UI. One runtime makes setup, review and maintenance clear. |
| What is not complete? | Community participation, notifications, account management, pagination, production abuse controls and user-specific timezones. |
| What would scale next? | Paginated APIs, historical scheduling rules, bounded progress queries, rate limits and provider spend controls. |

## Personal contribution

Before presenting, identify what you personally designed, implemented, tested or modified. The repository includes Mocha scaffolding and an external authentication SDK. Use concrete examples and acknowledge assistance. Be able to walk from a React form through validation, authorization, SQL and the UI refresh without reading a prepared answer.

## Regression checks

`npm test` exercises real Hono routes with local SQLite, including missing-auth failure, cross-owner writes, unique check-ins, invalid dates, archived metrics, no-key feedback and migration behavior. Pure progress tests cover gaps, yesterday's streak, multiple same-day completions and year boundaries. Live OAuth/OpenAI behavior still needs configured external services.
