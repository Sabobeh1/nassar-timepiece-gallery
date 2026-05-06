# Engineering Brief — Multi-Tenant Bot-SaaS Implementation

## Your role

You are a senior full-stack engineer working in the **E-Commerce SaaS repository** (the project that owns `DDLs.sql` and `Functions.sql`). Your task: integrate an opt-in, multi-tenant AI ordering chatbot as a service alongside the existing storefront, **without breaking what's already there**.

## Materials

A reference bundle (`C:\Users\3715\Documents\GitHub\E-Commerce-Structure - Copy\nassar-bot-reference`) is provided in this workspace. It contains:

- The product spec (`BOT_SAAS_PRD.md`) — **authoritative**.
- The full proposed Supabase schema (`Database/Proposed/`) — ready to paste.
- A worked-example single-tenant bot (`Backend/`, `Frontend/`, `supabase/`) from the production Nassar Watches deployment.
- Env templates (`Backend/.env.example`, `Frontend/.env.example`, `supabase/.env.example`).

The reference code is **instructive, not authoritative**. When PRD and reference conflict, the PRD wins.

## Read in this order — do not skip

1. `BOT_SAAS_PRD.md` (full document, especially §6, §7, §8, §10, §11, §12, §13, §17, §18).
2. `README.md` at the bundle root.
3. `Database/SUPABASE_PROJECT.md` — target deployment + secrets handling.
4. `Database/Proposed/README.md` — schema apply procedure.
5. `Database/Existing/DDLs.sql` and `Functions.sql` — what the storefront currently has.
6. `Database/Proposed/00_full_schema.sql` — what you will deploy (full content also split across files 01–09 for review).
7. `Backend/api/_shared/{agent,guard,memory,systemPrompt}.ts` — bot internals worked example.
8. `Backend/api/_shared/tools/customerInfo.ts` — context-bound tool factory pattern.
9. `Frontend/src/components/ChatWidget.tsx` — widget worked example.

## What you will build

Three workspaces per PRD §5.1:

**Database** — apply `Database/Proposed/00_full_schema.sql` to the Supabase project documented in `Database/SUPABASE_PROJECT.md`. Single-paste in the SQL editor, or per-file via the CLI.

**Backend** — bot service on Vercel serverless. LangGraph ReAct agent + tools + guard + memory + tenant resolution. Every tool factory binds `client_id` server-side. **The LLM never receives `client_id` as a tool input** — exposing it is a P0 bug.

**Frontend** — embeddable chat widget that reads `data-client-slug` and `data-api-key` from its script tag and POSTs to the Backend webhook. Theming reads from `clients.bot_settings`. The widget loader silently no-ops if `clients.has_bot = false`.

## Non-negotiables

- **Never commit secrets.** All secrets live in gitignored `.env` files. The bundle ships `.env.example` templates with the project URL/ref prefilled and secret values blank.
- **All bot queries filter by `client_id` in application code.** The bot uses the service-role key (bypasses RLS); RLS does NOT protect bot queries.
- **RLS policies are still required** for storefront / anon paths (PRD §10.2).
- **Customer profile flow ports 1:1** from `Backend/api/_shared/tools/customerInfo.ts` — same 80% name-similarity verification, same save-after-order pattern. Add `client_id` to the bound context.
- **Length policy and abuse strike system** port from `Backend/api/_shared/guard.ts` — state keyed by `(client_id, session_id)`. Length: >500 first → soft warning prefix + still answers; second >500 → 10-min ban; >1000 → instant 10-min ban. Abuse: 3-strike alerts with suggestion menu, then escalating bans `[1, 3, 7, 15]` minutes.
- **Add a startup assertion** that scans every tool's input schema and rejects boot if any tool exposes a `client_id` field.
- **Per-tenant uniqueness** — every unique constraint on existing tables (`brands.slug`, `categories.slug`, `products.product_number`, `orders.order_number`) becomes composite with `client_id`.

## Credentials note

If any Supabase keys have been pasted into chat, documents, or screenshots that multiple people can see, **treat them as leaked**. Reset the JWT secret and revoke any `sb_secret_*` keys in the Supabase dashboard before fetching values into your local `.env`. Do this before deploying anything.

## What I want first — do NOT write code yet

Reply with:

1. **Architecture summary in your own words** — prove you've internalized the `client_id`-everywhere rule and the bot opt-in (`has_bot`) model.
2. **Resolution of PRD §13 open questions** — use the PRD's recommended defaults unless you have a strong reason to differ; flag any deviation for human review.
3. **Step-by-step implementation plan** mapped to PRD §11 phases. Mark each step as either "I can do this autonomously" or "needs human action" (e.g. "deployer must fetch service_role key from the Supabase dashboard").
4. **Risks and ambiguities** — anything in the PRD or schema you would push back on.

I will review and approve before you start writing code.

## Definition of done

- Every box in PRD §12 (Acceptance Criteria) checked.
- Two demo clients exist with intentionally overlapping slugs (`demo-a`, `demo-b`); isolation proven by SQL queries showing each can only see its own rows.
- A live web-widget conversation completes a full order flow on each demo client.
- Tool-registry assertion blocks startup if any tool exposes `client_id`.
- CI scan rejects commits containing strings matching `eyJ...`, `sk-...`, `service_role`, `sb_secret_`, or PEM key blocks.
- All three `.env.example` files are present, accurate, and committed; their corresponding `.env` files are in `.gitignore`.

## Cadence expectations

- Plan first; execute second. No code without an approved plan.
- One workspace at a time: Database → Backend → Frontend. Don't context-switch unless a blocker forces it.
- Commit early and often within each workspace. Small, reviewable diffs.
- After each major step, run the relevant acceptance test from PRD §12 and report the result.
