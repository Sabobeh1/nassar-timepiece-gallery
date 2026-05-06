# Nassar Bot — Reference Bundle

**Purpose:** This is read-only reference material for the engineering team building the multi-tenant E-Commerce SaaS chatbot described in `BOT_SAAS_PRD.md`.

These files are a **worked example** of the bot's internals from a single-tenant deployment (Nassar Watches). Use them to understand the *shape* of each piece — the LangGraph agent wiring, the strike-and-ban guard, the Supabase chat-history adapter, the tool factory pattern, the React widget. **Do not copy verbatim.** Generalize every pattern to be `client_id`-bound and per-tenant, exactly as the PRD specifies.

When the PRD and this reference disagree, **the PRD wins.**

## What's inside

```
Database/
  SUPABASE_PROJECT.md                Target project URL/ref + how to fetch secrets
  Existing/                          Reference: the current single-tenant SaaS schema
    DDLs.sql
    Functions.sql
  Proposed/                          Fresh-deployment SQL (paste into Supabase SQL editor)
    README.md                        Run order + idempotence notes
    00_full_schema.sql               Concatenation of files 01-09 — single-paste convenience
    01_extensions_and_enums.sql      pgcrypto, vector, uuid-ossp + 5 enums
    02_clients.sql                   Tenants table (incl. has_bot, bot_brief, bot_settings)
    03_catalog.sql                   brands, categories, discounts, shipping_regions, products
    04_orders.sql                    orders, orders_items
    05_storefront_config.sql         business_profile, site_configuration, announcements, feedbacks
    06_users_info.sql                Returning-customer profile (per tenant)
    07_bot_tables.sql                chat_messages, session_bans, product_embeddings
    08_triggers.sql                  set_updated_at, set_product_number, same-tenant FK guards
    09_functions.sql                 normalize_phone, generate_order_number, get_orders_by_mobile,
                                     get_order_items, place_order, match_products
    10_seed_example.sql              Optional commented-out seed for a demo client

Backend/
  .env.example                       Template (project URL prefilled; secrets blank)
  api/
    webhook.ts                       Web channel entry (POST /api/webhook)
    telegram.ts                      Telegram channel entry
    cron/
      sync-embeddings.ts             Embedding-refresh cron handler
    _shared/
      agent.ts                       LangGraph ReAct agent wiring
      guard.ts                       3-strike + escalating-ban + length policy
      memory.ts                      SupabaseChatMessageHistory adapter
      similarity.ts                  Name-similarity helper (used by lookup_customer)
      supabase.ts                    Service-role client
      systemPrompt.ts                Default brief (becomes per-client bot_brief)
      tools/
        customerInfo.ts              lookup_customer / save_customer
        inventoryCheck.ts
        listCategories.ts
        lookupOrders.ts
        placeOrder.ts
        productLookup.ts             RAG / vector search
  scripts/
    embedProducts.ts                 Bulk embedding generation
    setTelegramWebhook.ts            One-off webhook registration
  package.json
  tsconfig.json

Frontend/
  .env.example                       Template (VITE_BACKEND_URL + project URL prefilled)
  src/components/
    ChatWidget.tsx                   React widget + markdown renderer

supabase/
  .env.example                       Template (project ref prefilled)

supabase/
  migrations/
    20260415000000_product_embeddings.sql
    20260415010000_bot_core.sql
    20260416000000_session_bans.sql
    20260417000000_session_strikes.sql
```

## Key things to internalize, then reimplement per the PRD

1. **Tool factories bind context server-side.** `customerInfo.ts` and `placeOrder.ts` show the pattern: a `build*Tool({ channel, channel_user_id })` factory bakes runtime context into the tool's handler so the LLM never sees it. The PRD requires the same pattern, but with `client_id` added to the bound context. The LLM must NEVER receive `client_id` as a tool input.

2. **Guard state machine (`guard.ts`).** Three strikes → tiered abuse ban (1 / 3 / 7 / 15 min). Length: >500 first time → soft warning + still answer; second >500 → 10-min ban; >1000 → instant 10-min ban. State lives in `session_bans`. Port the logic, but key it by `(client_id, session_id)`.

3. **Memory adapter (`memory.ts`).** Implements LangChain's `BaseListChatMessageHistory` against a `chat_messages` table. Loads the most recent N messages (not the first N). Port it with a `client_id` parameter and a composite primary key.

4. **System prompt (`systemPrompt.ts`).** This file's `DEFAULT_BRIEF` is the **Nassar-specific** prompt. In the SaaS, the equivalent string becomes the `clients.bot_brief` value for the seed client; the loader falls back to a generic e-commerce template parameterized by `business_name`, `default_currency`, `default_locale`.

5. **Widget (`ChatWidget.tsx`).** The markdown renderer (bullets, numbered lists, hr, inline bold/italic/code) is reusable as-is. The `VITE_BACKEND_URL` constant becomes a runtime config object derived from `<script data-client-slug="..." data-api-key="...">` — see PRD §9.

6. **Migrations.** The SQL here is the bot's incremental layer over a single-tenant schema. The SaaS will rewrite these to include `client_id` everywhere and to use composite primary keys. Treat the SQL as a **column inventory**, not a migration to apply.

## What is intentionally NOT in this bundle

- Storefront pages, admin UI, auth flows — not relevant to the bot.
- Non-bot Supabase migrations (catalog tables, admin users) — the SaaS schema is its own design (see PRD §6).
- `.env` files — you must not put real secrets in a reference bundle. PRD §17 lists every env var by name.
- Lock files and `node_modules/` — install fresh.

## License / handling

This bundle is internal reference material. Do not redistribute or commit it to a public repository.
