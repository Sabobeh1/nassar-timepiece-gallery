# Target Supabase Project

This is the project to deploy the SaaS bot schema and Backend service against.

## Project info (NON-SECRET — safe to commit)

| Field | Value |
|---|---|
| Project URL | `https://rropzppodfgzvhkbtlrl.supabase.co` |
| Project ref | `rropzppodfgzvhkbtlrl` |
| Dashboard | `https://supabase.com/dashboard/project/rropzppodfgzvhkbtlrl` |

The **anon key** is also safe to share publicly — it is designed for browser code and is protected by Row-Level Security policies. The receiving agent should fetch it from the dashboard at:

`Settings → API → Project API keys → anon public`

and put it in `Frontend/.env` as `VITE_SUPABASE_ANON_KEY` (only if the storefront talks to Supabase directly; the bot does not need it).

## Secrets — fetch from dashboard, NEVER commit

The following are **secrets**. They MUST be fetched from the Supabase dashboard at deploy time and placed in local `.env` files (which are gitignored). Never paste them into chat, docs, code, or commit history. If they leak, rotate immediately.

| Secret | Where to find it | Where it goes |
|---|---|---|
| `service_role` JWT | `Settings → API → Project API keys → service_role` | `Backend/.env` as `SUPABASE_SERVICE_ROLE_KEY` |
| `sb_secret_*` | `Settings → API Keys` (Management API) | CI / deploy infra only — not bot runtime |
| Legacy JWT secret | `Settings → API → JWT Settings` | Not used by the bot. Used only if you sign custom JWTs. |
| DB password | `Settings → Database → Connection string` | `supabase/.env` as `SUPABASE_DB_PASSWORD` (CLI only) |
| Personal Access Token | `https://supabase.com/dashboard/account/tokens` (per developer) | `supabase/.env` as `SUPABASE_ACCESS_TOKEN` (CLI only) |

## How to apply the schema

```powershell
# Option 1 — paste the bundled SQL into the Supabase SQL editor
#   Open: https://supabase.com/dashboard/project/rropzppodfgzvhkbtlrl/sql/new
#   Paste: Database/Proposed/00_full_schema.sql
#   Run.
#
# Option 2 — CLI (preferred for repeatable deploys)
supabase link --project-ref rropzppodfgzvhkbtlrl
supabase db push       # if you've translated the SQL into supabase/migrations/*
```

## Once schema is applied

1. Insert at least one row in `public.clients` (see `Database/Proposed/10_seed_example.sql`).
2. Set `has_bot = true` for clients who should get the chatbot.
3. Generate embeddings for that client's products (`Backend/scripts/embedProducts.ts`).
4. Configure `Backend/.env` and `Frontend/.env` per `.env.example` files in each workspace.
5. Deploy Backend (Vercel) and the storefront/widget.

## Security baseline

- Apply RLS policies (PRD §10.2) to every tenant-scoped table — the storefront needs them; the bot uses the service-role key and is unaffected.
- Use Argon2id (or bcrypt) for `clients.api_key_hash` — never store plaintext API keys.
- Enable IP allowlisting on the Supabase dashboard once the deploy IPs are stable.
- Set up daily PITR snapshots in `Settings → Database → Backups`.
