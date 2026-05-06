# PRD — Multi-Tenant Chatbot Service for E-Commerce SaaS

**Document type:** Product / System-Architecture PRD
**Audience:** Engineering agent working in the E-Commerce SaaS repository (the one that currently owns `DDLs.sql` + `Functions.sql`).
**Purpose:** Specify the schema, function, backend, and frontend changes required to integrate an **opt-in, per-tenant AI ordering chatbot** into the existing e-commerce platform.
**Status:** Draft — implementation may proceed once "Open Questions" (§13) are resolved.

---

## 1. Executive Summary

The platform is a multi-tenant e-commerce SaaS. Every client (tenant) currently has their own catalog, orders, branding, and configuration. We are adding an **optional AI ordering assistant** that any client can enable via a single boolean flag.

When enabled for a client, the bot:

- Operates **exclusively** on that client's catalog (products, categories, brands, discounts, shipping regions).
- Maintains its **own conversation memory, embeddings, and abuse/spam state** per client.
- Is **fully isolated** — two clients with an identical product name, category slug, or session id never see each other's data.
- Inherits the client's storefront branding (currency, locale, business name) and follows a per-client system prompt.

Clients who do not opt in continue to operate exactly as today; no bot code path runs for them.

---

## 2. Goals

| # | Goal |
|---|---|
| G1 | One bot codebase serves every tenant. No per-client forks. |
| G2 | Strict data isolation by `client_id` on every table, function, and tool. |
| G3 | Onboarding a new bot client = inserting a `clients` row, flipping `has_bot = true`, and (optionally) generating embeddings. No code change. |
| G4 | Existing storefront tables and functions continue working with minimal disruption (additive changes, with a backfill phase). |
| G5 | Per-client behavior (tone, language, ban tuning, prompt) is configurable via DB columns — never hardcoded. |
| G6 | Bot infrastructure is deployable as an independent backend service. |

## 3. Non-Goals (v1)

- Cross-tenant analytics or shared knowledge between clients.
- More than one bot per client.
- Self-serve client onboarding (admin only).
- Custom bot UI per client (single widget, themed via settings).
- Voice or image input.
- Migrating the data of clients who do not opt in.

---

## 4. Reference: Current State

The existing schema (single-tenant, defined in `DDLs.sql` and `Functions.sql`) is:

**Tables.** `announcements`, `brands`, `business_profile` (singleton), `categories`, `discounts`, `feedbacks`, `orders`, `orders_items`, `products`, `shipping_regions`, `site_configuration` (singleton).

**Functions.** `generate_order_number()`, `get_order_items(p_order_id, p_mobile)`, `get_orders_by_mobile(p_mobile)`, `place_order(p_items, p_customer_*…)`, `rls_auto_enable` (event trigger), `set_updated_at`.

**Notable schema characteristics that influence the PRD:**

1. Customer info is stored **inline** on `orders` (`customer_first_name`, `customer_last_name`, `mobile_number`, `address`, `city_region`, etc.). There is **no separate customers/users_info table**.
2. `business_profile` and `site_configuration` are forced single-row tables via `CHECK (id = 1)`.
3. `rls_auto_enable` is an event trigger that turns RLS on automatically for new tables in `public`.
4. `place_order` validates stock and computes pricing server-side using `unit_price * (1 - discount_value/100)`.

---

## 5. Target Architecture

### 5.1 Repository Layout

The repository is split into three top-level workspaces:

```
/Frontend                 # Storefront (existing) + ChatWidget integration
  /src
    /components
      ChatWidget.tsx      # Bot widget (new)
    /lib
      botClient.ts        # Resolves client slug + sends webhook calls

/Backend                  # Bot service — Vercel serverless functions (new)
  /api
    webhook.ts            # POST /api/webhook            (web channel)
    telegram.ts           # POST /api/telegram           (telegram channel)
    /cron
      sync-embeddings.ts  # nightly embeddings refresh
    /_shared
      agent.ts            # LangGraph ReAct agent
      guard.ts            # spam / abuse / length protection
      memory.ts           # SupabaseChatMessageHistory (client-scoped)
      systemPrompt.ts     # client-aware prompt loader
      tenant.ts           # client resolution + auth
      supabase.ts         # service-role client
      /tools              # tools, all bound to client_id at runtime
        listCategories.ts
        listBrands.ts
        inventoryCheck.ts
        productLookup.ts
        lookupShippingFee.ts
        lookupCustomer.ts
        saveCustomer.ts
        lookupOrders.ts
        getOrderItems.ts
        placeOrder.ts
  /scripts
    embedProducts.ts      # bulk embedding generation per client
  package.json

/supabase                 # Existing migrations + new bot migrations
  /migrations
    <existing>
    NNNN_clients_table.sql
    NNNN_add_client_id.sql
    NNNN_composite_uniques.sql
    NNNN_singleton_to_per_tenant.sql
    NNNN_same_tenant_triggers.sql
    NNNN_bot_tables.sql
    NNNN_bot_functions.sql
    NNNN_function_signatures.sql
```

### 5.2 Multi-Tenancy Strategy

**Shared database, shared schema, with `client_id` on every tenant-scoped table.**

- Per-tenant uniqueness is enforced by composite unique constraints `(client_id, <field>)`.
- Cross-table foreign keys (e.g. `products.category_id`) are guarded by triggers that ensure the referenced row belongs to the same client.
- The bot connects with the Supabase service-role key (bypasses RLS) and **MUST filter every query by `client_id` in application code**. RLS protects the storefront and admin tooling, not the bot.

This trade-off is intentional: schema-per-tenant or DB-per-tenant adds operational overhead disproportionate to v1's needs. Revisit only if a client requires legal isolation.

---

## 6. Data Model Changes

### 6.1 New table — `clients`

```sql
create table public.clients (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,            -- "nassar-watches"
  business_name     text not null,
  default_locale    text not null default 'en',      -- 'en' | 'ar' | …
  default_currency  text not null default 'USD',
  has_bot           boolean not null default false,  -- master switch — bot is OPT-IN
  bot_brief         text,                            -- nullable; full system-prompt override
  bot_settings      jsonb not null default '{}'::jsonb,
  api_key_hash      text not null,                   -- argon2/bcrypt hash; never plaintext
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

create index idx_clients_slug on public.clients(slug);
```

`bot_settings` schema (all keys optional; backend uses defaults when absent):

```jsonc
{
  "ban_tiers_minutes": [1, 3, 7, 15], // abuse ban escalation
  "max_strikes": 3,                    // alerts before first abuse ban
  "length_warn_chars": 500,            // soft length warning threshold
  "length_hard_chars": 1000,           // hard length cutoff (instant ban)
  "length_ban_minutes": 10,            // length ban duration
  "spam_window_seconds": 30,
  "spam_max_messages": 5,
  "theme": { "accent": "#D4AF37", "mode": "dark" },
  "greeting_overrides": { "en": "...", "ar": "..." }
}
```

### 6.2 Add `client_id` to existing tables

Add `client_id uuid not null references public.clients(id) on delete cascade` plus a btree index to:

- `brands`
- `categories`
- `products`
- `discounts`
- `orders`
- `orders_items` (denormalized for query performance, even though it could be derived via `orders.client_id`)
- `shipping_regions`
- `feedbacks`
- `announcements`

Migration follows the **non-breaking three-step** pattern:

1. Add column as nullable.
2. Backfill (every existing row → seeded "default" client UUID).
3. Set `not null` and add the FK + index.

### 6.3 Composite unique constraints

The following unique constraints are tenant-scoped:

```sql
-- brands
alter table public.brands drop constraint brands_slug_key;
alter table public.brands add constraint brands_client_slug_unique unique (client_id, slug);

-- categories
alter table public.categories drop constraint categories_slug_key;
alter table public.categories add constraint categories_client_slug_unique unique (client_id, slug);

-- products
alter table public.products drop constraint products_product_number_key;
alter table public.products add constraint products_client_number_unique unique (client_id, product_number);

-- orders
alter table public.orders drop constraint orders_order_number_key;
alter table public.orders add constraint orders_client_order_number_unique unique (client_id, order_number);
```

`products_number_seq` (sequence) becomes per-client: either replace with a per-client sequence table, or compute the next value inside `place_order` from `max(product_number) + 1 where client_id = …`. **Decision deferred → §13 Q3.**

### 6.4 Singleton tables become per-tenant

`business_profile` and `site_configuration` currently use `id = 1`. New shape:

```sql
alter table public.business_profile drop constraint business_profile_pkey;
alter table public.business_profile drop column id;
alter table public.business_profile
  add column client_id uuid not null references public.clients(id) on delete cascade;
alter table public.business_profile add primary key (client_id);

-- identical pattern for site_configuration
```

### 6.5 Same-tenant FK guards

Cross-table FKs that don't already include `client_id` need a trigger to prevent referencing another tenant's row. Apply to:

| Child column | Parent | Trigger required? |
|---|---|---|
| `products.category_id` | `categories.id` | yes |
| `products.brand_id` | `brands.id` | yes |
| `products.discount_id` | `discounts.id` | yes |
| `orders_items.product_id` | `products.id` | yes |
| `feedbacks.product_id` | `products.id` | yes |

Reference trigger pattern:

```sql
create or replace function public.enforce_same_tenant_product_category()
returns trigger language plpgsql as $$
begin
  if new.category_id is not null then
    if not exists (
      select 1 from public.categories
      where id = new.category_id and client_id = new.client_id
    ) then
      raise exception 'category_id % does not belong to client %', new.category_id, new.client_id;
    end if;
  end if;
  return new;
end $$;

create trigger trg_products_same_tenant_category
  before insert or update of category_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_category();
```

### 6.6 New tenant table — `users_info` (returning-customer profile)

The existing `orders` schema stores customer details inline (`customer_first_name`, `mobile_number`, `address`, etc.) — that snapshot is preserved as-is. To support the bot's "have you ordered before?" flow without changing the bot's tool structure, add a separate **per-tenant customer-profile table** that stores reusable delivery details keyed by phone number.

```sql
create table public.users_info (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        not null references public.clients(id) on delete cascade,
  phone           text        not null,                   -- raw, normalized at write time
  first_name      text,
  last_name       text,
  country         text,
  region          text,                                   -- governorate / state
  city            text,
  address         text,
  postal_code     text,
  channel         text        check (channel in ('web','telegram')),
  channel_user_id text,
  last_seen_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  -- Phone uniqueness is per-tenant: two clients may legitimately share a customer.
  constraint users_info_client_phone_unique unique (client_id, phone)
);

create index idx_users_info_client_phone on public.users_info (client_id, phone);
```

Notes:

- **Phone is the customer key**, scoped per client. Two clients may have the same phone number; both rows are independent.
- **Snapshot vs. profile** — `orders` keeps its inline customer columns (so a delivery address frozen at order time is preserved even if the customer later updates their profile). `users_info` is the *reusable profile* the bot uses to recognize returning customers and pre-fill defaults.
- The existing storefront does not need to read `users_info`; it can continue to write inline customer columns on `orders`. Only the bot writes to `users_info` (via `save_customer` after a successful order).
- The phone normalization must match `orders.mobile_number`'s normalization (current `regexp_replace(..., '^\+?0*', '')`) so lookups across the two tables agree.

### 6.7 New bot-only tables

```sql
-- Conversation memory.
create table public.chat_messages (
  client_id   uuid        not null references public.clients(id) on delete cascade,
  session_id  text        not null,                   -- "web:<uuid>" or "tg:<chatId>"
  idx         int         not null,
  message     jsonb       not null,
  created_at  timestamptz not null default now(),
  primary key (client_id, session_id, idx)
);
create index idx_chat_messages_lookup
  on public.chat_messages (client_id, session_id, idx desc);

-- Guard state (strikes, bans, length warnings).
create table public.session_bans (
  client_id        uuid        not null references public.clients(id) on delete cascade,
  session_id       text        not null,
  banned_until     timestamptz null,
  strike_count     int         not null default 0,
  ban_count        int         not null default 0,
  long_msg_warned  boolean     not null default false,
  last_strike_at   timestamptz null,
  reason           text,
  created_at       timestamptz not null default now(),
  primary key (client_id, session_id)
);
create index idx_session_bans_until on public.session_bans (banned_until);

-- Vector store for RAG product search.
create extension if not exists vector;
create table public.product_embeddings (
  product_id  uuid          primary key references public.products(id) on delete cascade,
  client_id   uuid          not null references public.clients(id) on delete cascade,
  embedding   vector(1536)  not null,                  -- text-embedding-3-small
  content     text          not null,
  updated_at  timestamptz   not null default now()
);
create index idx_product_embeddings_client on public.product_embeddings (client_id);
create index idx_product_embeddings_vector
  on public.product_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

---

## 7. Function Changes

**Universal rule:** every tenant-scoped function takes `p_client_id uuid` as its first parameter and filters every query by it. The old single-tenant signatures are temporarily kept as **wrappers** that resolve to the seeded default client during the migration window (see §11 Phase 2), then dropped.

### 7.1 `generate_order_number(p_client_id uuid)`

Per-client sequence with a slug prefix for human-readable invoices.

```sql
create or replace function public.generate_order_number(p_client_id uuid)
returns text language plpgsql as $$
declare
  v_slug   text;
  v_prefix text;
  v_seq    int;
begin
  select upper(slug) into v_slug from public.clients where id = p_client_id;
  v_prefix := v_slug || '-ORD-' || to_char(now(), 'YYYYMMDD') || '-';
  select count(*) + 1 into v_seq
    from public.orders
   where client_id = p_client_id
     and order_number like v_prefix || '%';
  return v_prefix || lpad(v_seq::text, 4, '0');
end $$;
```

### 7.2 `get_orders_by_mobile(p_client_id, p_mobile)` and `get_order_items(p_client_id, p_order_id, p_mobile)`

Add `where client_id = p_client_id` to every SELECT. Mobile normalization logic (current `regexp_replace(..., '^\+?0*', '')`) is unchanged.

### 7.3 `place_order(p_client_id, …)`

Required changes:

1. Add `p_client_id uuid` as the first parameter.
2. **Validate every `product_id` in `p_items` belongs to `p_client_id`.** Reject the entire transaction otherwise:
   ```sql
   if exists (
     select 1 from jsonb_array_elements(p_items) i
     left join public.products p on p.id = nullif(i->>'product_id','')::uuid
     where i->>'product_id' is not null
       and (p.client_id is null or p.client_id <> p_client_id)
   ) then
     raise exception 'order contains products that do not belong to client %', p_client_id;
   end if;
   ```
3. Pass `client_id` into the `INSERT INTO orders` and `INSERT INTO orders_items`.
4. Stock decrement: add `and client_id = p_client_id` to the `UPDATE products` clause.
5. Order-number generation: `public.generate_order_number(p_client_id)`.

Pricing logic (`unit_price * (1 - discount_value/100)`) is unchanged.

### 7.4 New — `match_products(p_client_id, p_embedding, p_match_count)`

```sql
create or replace function public.match_products(
  p_client_id   uuid,
  p_embedding   vector(1536),
  p_match_count int default 5
) returns table (product_id uuid, similarity float, content text)
language sql stable as $$
  select pe.product_id,
         1 - (pe.embedding <=> p_embedding) as similarity,
         pe.content
    from public.product_embeddings pe
   where pe.client_id = p_client_id
   order by pe.embedding <=> p_embedding
   limit p_match_count;
$$;
```

### 7.5 Untouched

`set_updated_at` and `rls_auto_enable` are tenant-agnostic and need no change.

---

## 8. Backend (Bot Service)

### 8.1 Tenant Resolution & Auth

`POST /api/webhook` request body:

```json
{
  "client_slug": "nassar-watches",
  "api_key": "<plaintext-key>",
  "session_id": "<uuid>",
  "message": "<text>"
}
```

Middleware order (in `_shared/tenant.ts`):

1. Look up the row in `clients` where `slug = body.client_slug`.
2. Reject `404` if not found.
3. Reject `403` if `active = false` or `has_bot = false`.
4. Verify `api_key_hash` matches the provided plaintext using `argon2.verify`. Reject `401` on mismatch.
5. Inject `{ clientId, clientSlug, locale, currency, botSettings, botBrief }` into the request context.

For Telegram: each client provides their own bot token. Maintain a `bot_token → client_id` mapping (extra column on `clients` or a small lookup table). The webhook URL pattern is `/api/telegram` and the resolution happens via the incoming bot token.

### 8.2 Agent Construction

```ts
export async function runAgent(input: {
  clientId: string;
  channel: 'web' | 'telegram';
  channelUserId: string;
  sessionId: string;
  userMessage: string;
}) {
  // 1. Guard (state keyed by (clientId, sessionId)).
  const guard = await runGuard(input.clientId, input.sessionId, input.userMessage);
  if (!guard.allowed) return { reply: guard.userMessage, blocked: true };

  // 2. Load client config.
  const client = await loadClient(input.clientId);
  if (!client.has_bot) return { reply: 'Bot not enabled.', blocked: true };

  // 3. Build tools — clientId is bound here, NEVER exposed to the LLM.
  const tools = buildTools({
    clientId: input.clientId,
    channel: input.channel,
    channelUserId: input.channelUserId,
  });

  // 4. Load system prompt.
  const system = loadSystemPrompt(client);

  // 5. Conversation memory (also keyed by clientId).
  const history = new SupabaseChatMessageHistory(input.clientId, input.sessionId);
  const prior = await history.getMessages();

  // 6. Run LangGraph ReAct agent.
  const result = await agent.invoke({ messages: [system, ...prior, human] });

  // 7. Optional warning prefix (e.g. >500-char heads-up).
  const reply = guard.warningPrefix
    ? `${guard.warningPrefix}\n\n---\n\n${result.text}`
    : result.text;

  await history.addMessage(human);
  await history.addMessage(result.last);
  return { reply };
}
```

### 8.3 Tool Suite

All tool factories take `{ clientId, … }` and bake `client_id` into every query.
**The LLM MUST NEVER receive `client_id` as a tool input parameter** — it is bound at runtime, server-side, exactly as `channel_user_id` is bound today.

| Tool | Description | Underlying query |
|---|---|---|
| `list_categories` | Top-level categories, count of products per category | `select c.id, c.name, count(p.*) from categories c left join products p on p.category_id = c.id and p.client_id = $1 where c.client_id = $1 group by c.id order by c.display_order` |
| `list_brands` | All brands for the client | `select id, name, slug from brands where client_id = $1 order by display_order` |
| `inventory_check` | Filter by category/brand/name; returns price, stock, effective price after discount | `select … from products where client_id = $1 and (...filters)` |
| `product_lookup` | Semantic search via RAG | `match_products($1, $2_embedding, $3_count)` |
| `lookup_shipping_fee` | Fee by region name | `select fee, free_shipping_threshold from shipping_regions where client_id = $1 and name ilike $2` |
| `lookup_customer` | Verify a returning customer by phone + name (≥80% similarity on first+last name) | `select … from users_info where client_id = $1 and phone = $2_normalized` |
| `save_customer` | Upsert customer profile after a confirmed order or when the customer provides new delivery details | `insert into users_info (client_id, phone, …) values ($1, $2, …) on conflict (client_id, phone) do update set …` |
| `lookup_orders` | Returning customer's orders by mobile | `get_orders_by_mobile($1, $2_mobile)` |
| `get_order_items` | Items for one order, mobile-gated | `get_order_items($1, $2_order_id, $3_mobile)` |
| `place_order` | Create a new order with items | `place_order($1, …)` |

Tool design notes:

- **Customer verification flow ports from Nassar 1:1.** The bot asks for phone + first/last name, calls `lookup_customer`, and matches names with ≥80% similarity (Levenshtein or `pg_trgm`) to defeat minor typos. On match → display saved details and ask for confirmation/edits. On miss → fall through to the "new customer" branch, collect details, and call `save_customer` before `place_order`.
- **`save_customer` is also called for new customers** at the end of the order flow (after `place_order` succeeds), so future orders by the same phone are recognized. Phone normalization (`regexp_replace(..., '^\+?0*', '')`) is applied at write time to keep `users_info.phone` and `orders.mobile_number` aligned.
- **Effective price display** must mirror `place_order`'s computation: `unit_price * (1 - discount_value/100)`. The bot reads `discount_value` from the linked `discounts` row and from `products.custom_discount_value` and uses whichever applies.
- **Currency** is read from `clients.default_currency` and prepended to every price the bot displays.

### 8.4 Guard

Per-(client, session) state keyed in `session_bans`. Behavior matches the reference implementation in this Nassar repo's `Backend/api/_shared/guard.ts`:

| Trigger | Effect |
|---|---|
| Length > 1000 chars | Instant length ban (no answer). Default 10 min. |
| First Length 501–1000 chars | Soft warning prepended to the bot's reply (still answers). Sets `long_msg_warned = true`. |
| Second Length 501–1000 chars while still warned | Length ban (no answer). |
| 5 messages within 30 sec | Strike (alert + suggestion menu). |
| LLM classifier returns `ABUSE` | Strike. |
| 4th strike (after 3 alerts) | Abuse ban with escalating duration: 1 / 3 / 7 / 15 min. |

All thresholds are overridable per client via `clients.bot_settings` (see §6.1).

### 8.5 System Prompt Loader

```ts
export function loadSystemPrompt(client: Client): string {
  if (client.bot_brief?.trim()) return client.bot_brief;

  // Fallback: generic e-commerce template, parameterized by client config.
  return DEFAULT_BRIEF_TEMPLATE
    .replace('{{business_name}}', client.business_name)
    .replace('{{currency}}', client.default_currency)
    .replace('{{locale}}', client.default_locale);
}
```

The default brief instructs the bot on the universal flow (greeting → discovery → selection → verification → review → place order → confirmation) and the universal formatting rules. The Nassar-specific prompt becomes the `bot_brief` value of the Nassar `clients` row.

### 8.6 Embeddings Generation

`scripts/embedProducts.ts`:

- For a given `client_id`, fetch every product (`name`, `description`, brand name, category name, key `filter_attributes`).
- Build the embedded text per product: `"{name}. {brand}. {category}. {description}. {key_attrs}"`.
- Call OpenAI `text-embedding-3-small` (1536 dims) and `upsert` into `product_embeddings` with `client_id`.
- Track `updated_at` per row; cron skips rows whose source row is older than the embedding.

A nightly cron (`/api/cron/sync-embeddings.ts`) runs the same script for every active client where `has_bot = true`.

---

## 9. Frontend

### 9.1 Embed contract

Each storefront includes a script tag with the client slug + API key:

```html
<script
  src="https://bot.example.com/widget.js"
  data-client-slug="nassar-watches"
  data-api-key="ek_live_..."
  defer></script>
```

The widget loader:

1. Reads both data attributes.
2. Calls `GET /api/config?slug=...` once to learn whether `has_bot` is true. If false → silently no-op.
3. If true → mounts the chat widget into the page.

### 9.2 Widget behavior

- Generates a per-browser session UUID and stores it in `localStorage` under a slug-namespaced key (`<slug>_chat_session`).
- Stores message history under `<slug>_chat_history` (also namespaced — two storefronts on the same browser do NOT share history).
- Sends every message to `POST /api/webhook` with `{ client_slug, api_key, session_id, message }`.
- Renders bot replies through the existing markdown renderer (bold, bullet lists, numbered lists, hr, inline code).
- Theming pulls accent color and mode from `clients.bot_settings.theme`.

### 9.3 Component reuse

The reference component is `Frontend/src/components/ChatWidget.tsx` in the Nassar repo. Port it into the SaaS Frontend; replace the hardcoded `VITE_BACKEND_URL` constant with a runtime config object derived from the script-tag data attributes.

---

## 10. Auth, RLS & Security

### 10.1 API key model

- Each client has one primary API key, stored hashed (`argon2id`).
- The plaintext key is shown to the admin once at creation.
- The widget sends the plaintext over HTTPS; the backend verifies the hash on every request.
- Key rotation: `clients.api_key_hash` is replaced; any deployed widget must be updated.

### 10.2 Row-Level Security

The bot uses the Supabase **service-role** key, which bypasses RLS. **All tenant filtering for the bot happens in application code (every query includes `client_id = $1`).**

The storefront and admin tooling DO use anon/auth roles, so RLS protects them. Add policies for every tenant-scoped table:

```sql
create policy tenant_read on public.products for select
  using (client_id = current_setting('app.client_id', true)::uuid);

create policy tenant_write on public.products for all
  using  (client_id = current_setting('app.client_id', true)::uuid)
  with check (client_id = current_setting('app.client_id', true)::uuid);
```

The storefront must call `set_config('app.client_id', '<uuid>', true)` at the start of every connection / request.

### 10.3 Tool-argument discipline

Tool factories build their Zod schemas WITHOUT `client_id`. If a tool definition ever surfaces `client_id` to the LLM, this is a P0 bug. Add a startup assertion that scans every tool's schema and rejects the deploy if any tool exposes a `client_id` field.

---

## 11. Migration Plan (Phased)

### Phase 1 — Schema scaffolding (additive, non-breaking)

1. Create `clients` table.
2. Insert one seed row representing the existing single-tenant data (call it the "default" client; the Nassar Watches data lives here).
3. Add `client_id uuid null` to every tenant-scoped table.
4. Backfill: `update <table> set client_id = '<seed-uuid>'`.
5. Set `not null`, add FK, index.
6. Add the composite unique constraints (drop old single-column uniques first).
7. Convert `business_profile` and `site_configuration` to per-tenant PKs.
8. Install same-tenant FK triggers.

After Phase 1, the storefront still runs unchanged because all queries naturally hit the seed client's rows.

### Phase 2 — Function signatures

1. Rename existing functions to `<name>_v1` (kept as wrappers calling `<name>_v2` with the seeded default client_id).
2. Implement `<name>_v2` versions taking `p_client_id` first.
3. Migrate the storefront server code to call the v2 functions explicitly with the resolved client_id.
4. Drop the v1 wrappers once the storefront migration is verified.

### Phase 3 — Bot tables and embeddings

1. Create `users_info` (per-tenant customer profiles).
2. Create `chat_messages`, `session_bans`, `product_embeddings`.
3. Create `match_products`.
3. Run `scripts/embedProducts.ts` for the seed client.

### Phase 4 — Backend bot service

1. Stand up `Backend/` per §5.1.
2. Implement tenant resolution middleware.
3. Implement guard, memory, agent, all tools.
4. Smoke test against the seed client.
5. Deploy to staging.

### Phase 5 — Frontend widget

1. Build `widget.js` bundle.
2. Add `GET /api/config` for the `has_bot` probe.
3. Embed in the seed client's storefront.
4. Verify isolation by creating a second test client and confirming no cross-data is visible.

### Phase 6 — Admin onboarding

1. Admin UI to create a client (sets slug, business_name, generates API key, optionally flips `has_bot`).
2. Admin UI to toggle `has_bot` and to (re)generate embeddings.
3. Document the runbook.

---

## 12. Acceptance Criteria

The change is shippable when ALL of the following are true:

- [ ] `clients` table exists with all fields specified in §6.1.
- [ ] Every tenant-scoped table has `client_id` (NOT NULL, FK, indexed) and the appropriate composite unique constraints.
- [ ] Singleton tables (`business_profile`, `site_configuration`) are now keyed by `client_id`.
- [ ] Same-tenant FK triggers are installed and tested with a deliberate cross-tenant insertion attempt (which must fail).
- [ ] All functions take `p_client_id` and filter by it. Old signatures removed.
- [ ] `place_order` rejects an order containing any product that does not belong to the calling client.
- [ ] Two clients can have brands, categories, products, or orders sharing identical names/slugs/numbers without conflict.
- [ ] Two clients can have customers in `users_info` with the same `phone`; `lookup_customer` returns the correct row per client.
- [ ] Disabling `has_bot` for a client immediately blocks the widget for that client (config probe returns `enabled: false`; webhook returns 403).
- [ ] Bot guard state is keyed by `(client_id, session_id)`. A ban on client A does not affect a session with the same id on client B.
- [ ] Embeddings generated for client A never appear in `product_lookup` results for client B (verified by test).
- [ ] No tool exposes `client_id` in its schema (startup assertion in place).
- [ ] Existing storefront flows continue to work unchanged for the seed client throughout the migration.
- [ ] Bot response time p95 ≤ 4 s (excluding LLM time).

---

## 13. Open Questions

| # | Question | Recommendation |
|---|---|---|
| Q1 | Telegram: shared bot account with `/command` routing, or one Telegram bot per client? | **One bot per client.** Simpler UX, no command routing required. Add `telegram_bot_token` column to `clients`. |
| Q2 | Bot brief storage: free-text full prompt, or structured JSON the backend templates? | **Both.** Free-text `bot_brief` overrides; otherwise template + `bot_settings`. Frees clients to override fully when needed. |
| Q3 | `products.product_number` sequence — global, or per-client? | **Per-client.** Replace `nextval('products_number_seq')` with a trigger that computes `max(product_number) + 1 where client_id = NEW.client_id`. |
| Q4 | Embeddings refresh — webhook on product update, periodic cron, or both? | **Both.** Webhook for fast updates; nightly cron as safety net. |
| Q5 | Soft-delete vs cascade delete for clients? | **Soft via `active = false`** in v1; cascade only when an admin explicitly purges a client. |
| Q6 | `chat_messages` retention | **30 days rolling**, with a daily cleanup cron. Configurable per client via `bot_settings.chat_retention_days`. |
| Q7 | Should non-bot clients still get `chat_messages` and `session_bans` rows? | **No.** Those tables are only written when `has_bot = true`. |

---

## 14. Out of Scope (v1)

- Cross-client analytics dashboard.
- Self-serve client onboarding (admin only in v1).
- Bot UI customization beyond accent color / mode (one widget design).
- Voice or image input.
- Payment gateway integration in `place_order` (cash on delivery only, as today).
- Multi-currency cart logic — orders are denominated in the client's `default_currency`.
- A/B testing of prompts.

---

## 15. Glossary

| Term | Meaning |
|---|---|
| Client / Tenant | One row in the `clients` table. Owns a fully isolated catalog and bot state. |
| Seed client | The single existing tenant created during Phase 1 to back-fill all pre-existing rows. |
| Bot brief | The system prompt for the LLM. Either free-text (`clients.bot_brief`) or generated from a default template + `bot_settings`. |
| Strike | A single rule violation tracked in `session_bans.strike_count`. Three strikes (alerts) precede the first abuse ban. |
| Length ban | A 10-minute ban triggered by a second oversize message OR any message past the hard cutoff. Tracked independently of abuse strikes. |

---

## 16. Reference Implementation

This PRD is informed by an existing Nassar Watches single-tenant bot. The reference repo (which the engineering agent should treat as a worked example, NOT as a codebase to copy verbatim) demonstrates:

- LangGraph ReAct agent wiring (`Backend/api/_shared/agent.ts`).
- Three-strike + escalating-ban guard (`Backend/api/_shared/guard.ts`).
- Length-policy with soft-warn prefix (`Backend/api/_shared/guard.ts` `checkLength`).
- Supabase chat-history adapter (`Backend/api/_shared/memory.ts`).
- Tool factories that bind `channel_user_id` server-side (`Backend/api/_shared/tools/*.ts`).
- **Customer profile tools** — `lookupCustomer.ts` and `saveCustomer.ts` port 1:1 to the SaaS now that `users_info` exists. Add `client_id` to the bound context (`buildLookupCustomerTool({ clientId, channel, channelUserId })`) and append `where client_id = $1` to every query. The 80%-name-similarity verification logic is unchanged.
- React widget with markdown renderer (`Frontend/src/components/ChatWidget.tsx`).

The engineering agent should generalize these patterns to `client_id`-bound tools and per-tenant state, NOT copy them as-is. The Nassar prompt and Nassar product-shape assumptions must be replaced by the client-aware loader described in §8.5.

---

## 17. Environment Variables

Each workspace owns its own `.env` file. Nothing is shared across workspaces. The Frontend must NEVER receive any secret (no service-role key, no OpenAI key, no Telegram token) — it only knows the public Backend URL.

### 17.1 Backend (`/Backend/.env`)

Loaded by Vercel functions (and `tsx` for scripts/cron). All secrets live here.

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL, e.g. `https://<ref>.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only key. Bypasses RLS. **Never exposed to the frontend.** |
| `OPENAI_API_KEY` | yes | OpenAI API key (for the agent LLM, the message classifier, and embeddings). |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini`. Override per-deployment if you want a stronger/cheaper model. |
| `OPENAI_EMBEDDING_MODEL` | no | Defaults to `text-embedding-3-small`. Must match the dimension on `product_embeddings.embedding` (1536). |
| `ALLOWED_ORIGIN` | yes | CORS allow-list for `/api/webhook`. In production set to the storefront origin (or comma-separated list); never leave as `*` once you go live. |
| `CRON_SECRET` | yes | Shared secret for the embeddings cron endpoint. Vercel Cron sends it as `Authorization: Bearer <secret>`. |
| `TELEGRAM_BOT_TOKEN_<SLUG>` | per client | Pattern for one-bot-per-client (Q1 in §13). E.g. `TELEGRAM_BOT_TOKEN_NASSAR_WATCHES`. The webhook resolves `client_slug → token` at startup. Alternative: store the token on `clients.telegram_bot_token` instead and skip the env var entirely (recommended for self-serve). |
| `BACKEND_URL` | yes (scripts only) | Used by `scripts/setTelegramWebhook.ts` to register the Telegram webhook against the deployed backend. |
| `LOG_LEVEL` | no | `debug` / `info` / `warn` / `error`. Defaults to `info`. |

`.env.example` (committed; no real values) documents every key. `.env` (uncommitted) holds real values. Vercel project settings override both for production.

### 17.2 Frontend (`/Frontend/.env`)

Vite-prefixed (`VITE_*`) keys are inlined into the bundle and visible to anyone who views page source. **Treat them as public.**

| Variable | Required | Purpose |
|---|---|---|
| `VITE_BACKEND_URL` | yes | Public Backend base URL, e.g. `https://bot.example.com`. The widget posts to `${VITE_BACKEND_URL}/api/webhook`. |
| `VITE_DEFAULT_CLIENT_SLUG` | no | Used only when the host page does NOT provide `data-client-slug` on the script tag. Useful for local dev. |

The per-tenant **API key** (`api_key_hash` in DB) is provided by the host page via `<script data-api-key="...">`, NOT through env. This way one Frontend bundle serves every tenant.

Anything secret (OpenAI key, service role key, Telegram tokens) MUST NOT be in this file. CI should fail the build if it detects a non-`VITE_`-prefixed key, or any key matching `*KEY*` / `*SECRET*` / `*TOKEN*`.

### 17.3 Supabase (`/supabase/.env` — local dev / CLI only)

The `supabase` CLI reads these for `supabase db push`, `supabase functions deploy`, etc. They are **operator credentials**, not runtime secrets, and are never deployed.

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_PROJECT_REF` | yes | The 20-char project ref (e.g. `abcd1234efgh5678ijkl`). Used by `supabase link`. |
| `SUPABASE_DB_PASSWORD` | yes | DB password for `supabase db push` migrations against the linked project. |
| `SUPABASE_ACCESS_TOKEN` | yes | Personal access token from the Supabase dashboard. Used by the CLI to authenticate. |

Production migrations should run from CI using these as encrypted CI secrets — never run `db push` from a developer laptop pointed at production.

### 17.4 CI / Deployment

The CI runner needs:

- All Backend keys from §17.1 (set as encrypted secrets in GitHub Actions / Vercel env).
- All Supabase CLI keys from §17.3 (for the migration job).
- A separate CI key per environment: `STAGING_*` and `PRODUCTION_*` prefixes, never share an OpenAI key across envs (rate-limit blast radius).

### 17.5 Local development quickstart

```bash
# Backend
cd Backend
cp .env.example .env             # fill in Supabase + OpenAI keys
npm install
npm run dev                      # vercel dev on :3000

# Frontend
cd Frontend
cp .env.example .env             # set VITE_BACKEND_URL=http://localhost:3000
npm install
npm run dev                      # vite on :5173

# Supabase (local)
cd supabase
cp .env.example .env             # set SUPABASE_PROJECT_REF + access token
supabase link --project-ref $SUPABASE_PROJECT_REF
supabase db push                 # apply migrations
```

### 17.6 Secret hygiene

- Every workspace ships a `.env.example` with all keys present and dummy values.
- Real `.env` files are in `.gitignore` (verify before merging).
- Add a pre-commit hook (or CI scan) that rejects commits containing strings matching `sk-...`, `eyJ...`, `service_role`, etc.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` on any suspected leak; both are easy to rotate from their respective dashboards without a code change.

---

**End of PRD.**
