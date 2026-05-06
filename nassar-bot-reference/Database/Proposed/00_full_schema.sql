-- =====================================================================
-- BOT-SAAS — FULL SCHEMA (concatenated, one-shot Supabase paste)
--
-- Run order matches the file numbers below. Paste this entire file into
-- the Supabase SQL editor and run once. Idempotent (CREATE … IF NOT EXISTS
-- and DO blocks for enums) so re-running is safe.
--
-- After running, optionally seed a test client by editing 10_seed_example.sql.
-- =====================================================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 01_extensions_and_enums.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 01 — Extensions & enums
-- Run this FIRST. All tables and functions depend on it.
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";  -- legacy uuid_generate_v4(); kept for compat
create extension if not exists pgcrypto;     -- gen_random_uuid()
create extension if not exists vector;       -- pgvector for product embeddings

-- ── Enums (USER-DEFINED types from existing schema) ───────────────
-- Adjust values to match your business needs before running.

do $$ begin
  create type public.announcement_type as enum ('text', 'image', 'mixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum (
    'cash_on_delivery', 'card', 'bank_transfer'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending', 'confirmed', 'preparing', 'shipped',
    'delivered', 'cancelled', 'returned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.layout_name as enum ('classic', 'modern', 'minimal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.theme_name as enum ('light', 'dark', 'auto');
exception when duplicate_object then null; end $$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 02_clients.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 02 — Tenants table (PRD §6.1)
-- Every other tenant-scoped table FKs to this.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.clients (
  id                    uuid        primary key default gen_random_uuid(),
  slug                  text        unique not null,         -- e.g. "nassar-watches"
  business_name         text        not null,
  default_locale        text        not null default 'en',
  default_currency      text        not null default 'USD',
  has_bot               boolean     not null default false,  -- master opt-in switch
  bot_brief             text,                                 -- nullable; full prompt override
  bot_settings          jsonb       not null default '{}'::jsonb,
  api_key_hash          text        not null,                 -- argon2/bcrypt hash; never plaintext
  telegram_bot_token    text,                                 -- per-client telegram token (PRD §13 Q1)
  telegram_bot_username text,
  active                boolean     not null default true,
  created_at            timestamptz not null default now()
);

create index if not exists idx_clients_slug
  on public.clients(slug);

create unique index if not exists uniq_clients_telegram_token
  on public.clients(telegram_bot_token)
  where telegram_bot_token is not null;

-- Expected shape of bot_settings (every key optional; backend defaults apply):
-- {
--   "ban_tiers_minutes": [1, 3, 7, 15],
--   "max_strikes": 3,
--   "length_warn_chars": 500,
--   "length_hard_chars": 1000,
--   "length_ban_minutes": 10,
--   "spam_window_seconds": 30,
--   "spam_max_messages": 5,
--   "chat_retention_days": 30,
--   "theme": { "accent": "#D4AF37", "mode": "dark" }
-- }


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 03_catalog.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 03 — Catalog tables
-- brands, categories, discounts, shipping_regions, products
-- All tenant-scoped via client_id. Composite uniques baked in.
-- ═══════════════════════════════════════════════════════════════════

-- ── brands ─────────────────────────────────────────────────────────
create table if not exists public.brands (
  id            uuid        primary key default gen_random_uuid(),
  client_id     uuid        not null references public.clients(id) on delete cascade,
  name          text        not null,
  slug          text        not null,
  logo_url      text,
  display_order int         not null default 0,
  created_at    timestamptz not null default now(),
  constraint brands_client_slug_unique unique (client_id, slug)
);
create index if not exists idx_brands_client_id on public.brands(client_id);

-- ── categories ─────────────────────────────────────────────────────
create table if not exists public.categories (
  id            uuid        primary key default gen_random_uuid(),
  client_id     uuid        not null references public.clients(id) on delete cascade,
  name          text        not null,
  slug          text        not null,
  parent_id     uuid        references public.categories(id),
  icon_url      text,
  display_order int         not null default 0,
  created_at    timestamptz not null default now(),
  constraint categories_client_slug_unique unique (client_id, slug)
);
create index if not exists idx_categories_client_id on public.categories(client_id);
create index if not exists idx_categories_parent_id on public.categories(parent_id);

-- ── discounts ──────────────────────────────────────────────────────
create table if not exists public.discounts (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        not null references public.clients(id) on delete cascade,
  name            text        not null,
  description     text,
  discount_value  numeric     not null default 0
                  check (discount_value >= 0 and discount_value <= 100),
  start_date      timestamptz,
  end_date        timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_discounts_client_id on public.discounts(client_id);

-- ── shipping_regions ───────────────────────────────────────────────
create table if not exists public.shipping_regions (
  id                       uuid        primary key default gen_random_uuid(),
  client_id                uuid        not null references public.clients(id) on delete cascade,
  name                     text        not null,
  fee                      numeric     not null default 0 check (fee >= 0),
  free_shipping_threshold  numeric,
  display_order            int         not null default 0,
  created_at               timestamptz not null default now(),
  constraint shipping_regions_client_name_unique unique (client_id, name)
);
create index if not exists idx_shipping_regions_client_id on public.shipping_regions(client_id);

-- ── products ───────────────────────────────────────────────────────
-- product_number is per-client; populated by trigger in 08_triggers.sql.
create table if not exists public.products (
  id                        uuid        primary key default gen_random_uuid(),
  client_id                 uuid        not null references public.clients(id) on delete cascade,
  product_number            int,                                       -- per-client; set by trigger
  name                      text        not null,
  description               text,
  price                     numeric     not null default 0 check (price >= 0),
  stock_quantity            int         not null default 0 check (stock_quantity >= 0),
  category_id               uuid        references public.categories(id),
  brand_id                  uuid        references public.brands(id),
  discount_id               uuid        references public.discounts(id),
  custom_discount_value     numeric     check (custom_discount_value is null
                                                or (custom_discount_value >= 0
                                                    and custom_discount_value <= 100)),
  images                    text[]      not null default '{}'::text[],
  filter_attributes         jsonb       not null default '{}'::jsonb,
  filter_attribute_images   jsonb       not null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint products_client_number_unique unique (client_id, product_number)
);
create index if not exists idx_products_client_id   on public.products(client_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id    on public.products(brand_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 04_orders.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 04 — Orders & order items
-- Customer details are stored INLINE on orders (delivery snapshot at
-- order time). The reusable customer profile lives in users_info (file 06).
-- ═══════════════════════════════════════════════════════════════════

-- ── orders ─────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                       uuid        primary key default gen_random_uuid(),
  client_id                uuid        not null references public.clients(id) on delete cascade,
  order_number             text        not null,
  customer_first_name      text        not null,
  customer_last_name       text        not null,
  mobile_number            text        not null,
  secondary_mobile_number  text,
  country                  text,
  city_region              text        not null,
  address                  text        not null,
  shipping_fee             numeric     not null default 0,
  subtotal                 numeric     not null default 0,
  total                    numeric     not null default 0,
  payment_method           public.payment_method not null default 'cash_on_delivery',
  status                   public.order_status   not null default 'pending',
  note                     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint orders_client_order_number_unique unique (client_id, order_number)
);
create index if not exists idx_orders_client_id     on public.orders(client_id);
create index if not exists idx_orders_mobile_number on public.orders(client_id, mobile_number);
create index if not exists idx_orders_status        on public.orders(client_id, status);

-- ── orders_items ───────────────────────────────────────────────────
-- client_id is denormalized for query performance and to allow the
-- same-tenant FK trigger on product_id (file 08).
create table if not exists public.orders_items (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        not null references public.clients(id) on delete cascade,
  order_id        uuid        not null references public.orders(id) on delete cascade,
  product_id      uuid        references public.products(id),
  product_name    text        not null,
  unit_price      numeric     not null,
  discount_value  numeric     not null default 0,
  quantity        int         not null check (quantity > 0),
  line_total      numeric     not null,
  variant         jsonb       not null default '{}'::jsonb,
  note            text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_orders_items_client_id  on public.orders_items(client_id);
create index if not exists idx_orders_items_order_id   on public.orders_items(order_id);
create index if not exists idx_orders_items_product_id on public.orders_items(product_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 05_storefront_config.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 05 — Storefront configuration tables
-- business_profile and site_configuration are now keyed by client_id
-- (one row per tenant; the legacy id=1 singleton is dropped).
-- announcements and feedbacks are tenant-scoped lists.
-- ═══════════════════════════════════════════════════════════════════

-- ── business_profile (per-tenant) ──────────────────────────────────
create table if not exists public.business_profile (
  client_id        uuid        primary key references public.clients(id) on delete cascade,
  business_name    text        not null default 'Storefront',
  logo_url         text,
  primary_mobile   text,
  facebook_url     text,
  instagram_url    text,
  whatsapp_url     text,
  tiktok_url       text,
  snapchat_url     text,
  updated_at       timestamptz not null default now()
);

-- ── site_configuration (per-tenant) ────────────────────────────────
create table if not exists public.site_configuration (
  client_id                       uuid        primary key references public.clients(id) on delete cascade,
  active_layout                   public.layout_name not null default 'classic',
  active_theme                    public.theme_name  not null default 'light',
  show_feedback_section           boolean     not null default true,
  show_language_selector          boolean     not null default true,
  enable_countdown_timers         boolean     not null default true,
  new_arrivals_days               int         not null default 21,
  default_locale                  text        not null default 'ar',
  default_currency                text        not null default 'ILS',
  schema_version                  int         not null default 1,
  updated_at                      timestamptz not null default now(),
  custom_color_primary            text,
  custom_color_primary_foreground text,
  custom_color_accent             text,
  custom_color_bg                 text,
  custom_color_surface            text,
  custom_color_text               text,
  custom_color_text_muted         text,
  custom_color_border             text,
  policy_delivery                 text,
  policy_exchange                 text,
  policy_refund                   text
);

-- ── announcements (per-tenant) ─────────────────────────────────────
create table if not exists public.announcements (
  id                  uuid                    primary key default gen_random_uuid(),
  client_id           uuid                    not null references public.clients(id) on delete cascade,
  type                public.announcement_type not null default 'text',
  content             text                    not null,
  images              text[]                  not null default '{}'::text[],
  announcement_order  int                     not null default 0,
  start_date          timestamptz,
  end_date            timestamptz,
  active              boolean                 not null default true,
  created_at          timestamptz             not null default now()
);
create index if not exists idx_announcements_client_id on public.announcements(client_id);

-- ── feedbacks (per-tenant) ─────────────────────────────────────────
create table if not exists public.feedbacks (
  id                  uuid        primary key default gen_random_uuid(),
  client_id           uuid        not null references public.clients(id) on delete cascade,
  customer_name       text        not null,
  feedback_text       text        not null,
  product_id          uuid        references public.products(id),
  product_image_url   text,
  created_at          timestamptz not null default now()
);
create index if not exists idx_feedbacks_client_id  on public.feedbacks(client_id);
create index if not exists idx_feedbacks_product_id on public.feedbacks(product_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 06_users_info.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 06 — Returning-customer profile (PRD §6.6)
-- The bot writes here via save_customer; reads via lookup_customer.
-- The orders table keeps its inline customer columns (delivery snapshot
-- at order time). users_info is the *reusable* profile.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.users_info (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        not null references public.clients(id) on delete cascade,
  phone           text        not null,                       -- normalize via normalize_phone() at write time
  first_name      text,
  last_name       text,
  country         text,
  region          text,                                       -- governorate / state
  city            text,
  address         text,
  postal_code     text,
  channel         text        check (channel in ('web','telegram')),
  channel_user_id text,
  last_seen_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  -- Phone is unique per tenant. Two clients may share a customer phone.
  constraint users_info_client_phone_unique unique (client_id, phone)
);

create index if not exists idx_users_info_client_phone
  on public.users_info(client_id, phone);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 07_bot_tables.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 07 — Bot-only tables (PRD §6.7)
-- Only ever populated when clients.has_bot = true. PKs include
-- client_id so two clients with the same session_id never collide.
-- ═══════════════════════════════════════════════════════════════════

-- ── chat_messages — conversation memory ────────────────────────────
create table if not exists public.chat_messages (
  client_id   uuid        not null references public.clients(id) on delete cascade,
  session_id  text        not null,                          -- "web:<uuid>" or "tg:<chatId>"
  idx         int         not null,
  message     jsonb       not null,
  created_at  timestamptz not null default now(),
  primary key (client_id, session_id, idx)
);
create index if not exists idx_chat_messages_lookup
  on public.chat_messages (client_id, session_id, idx desc);

-- ── session_bans — guard state (strikes, bans, length warnings) ────
create table if not exists public.session_bans (
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
create index if not exists idx_session_bans_until on public.session_bans(banned_until);

-- ── product_embeddings — vector store for RAG product search ───────
create table if not exists public.product_embeddings (
  product_id  uuid          primary key references public.products(id) on delete cascade,
  client_id   uuid          not null references public.clients(id) on delete cascade,
  embedding   vector(1536)  not null,                        -- text-embedding-3-small
  content     text          not null,
  updated_at  timestamptz   not null default now()
);
create index if not exists idx_product_embeddings_client
  on public.product_embeddings (client_id);

-- IVFFlat index for cosine similarity search.
-- Tune 'lists' as corpus grows: ≈ sqrt(rows) once you have real data.
create index if not exists idx_product_embeddings_vector
  on public.product_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 08_triggers.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 08 — Triggers
--   • set_updated_at — touch updated_at on every UPDATE
--   • set_product_number — assign per-client product_number on INSERT
--   • Same-tenant FK guards (PRD §6.5)
-- ═══════════════════════════════════════════════════════════════════

-- ── set_updated_at — generic helper ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_business_profile_set_updated_at
  before update on public.business_profile
  for each row execute function public.set_updated_at();

create trigger trg_site_configuration_set_updated_at
  before update on public.site_configuration
  for each row execute function public.set_updated_at();

-- ── set_product_number — per-client auto-increment ─────────────────
create or replace function public.set_product_number()
returns trigger language plpgsql as $$
begin
  if new.product_number is null then
    select coalesce(max(product_number), 0) + 1
      into new.product_number
      from public.products
     where client_id = new.client_id;
  end if;
  return new;
end $$;

create trigger trg_products_set_number
  before insert on public.products
  for each row execute function public.set_product_number();

-- ── Same-tenant FK guards (PRD §6.5) ───────────────────────────────
-- Without these, tenant A could insert a product referencing tenant B's
-- category. Triggers raise on any cross-tenant reference.

-- products.category_id
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

-- products.brand_id
create or replace function public.enforce_same_tenant_product_brand()
returns trigger language plpgsql as $$
begin
  if new.brand_id is not null then
    if not exists (
      select 1 from public.brands
       where id = new.brand_id and client_id = new.client_id
    ) then
      raise exception 'brand_id % does not belong to client %', new.brand_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_products_same_tenant_brand
  before insert or update of brand_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_brand();

-- products.discount_id
create or replace function public.enforce_same_tenant_product_discount()
returns trigger language plpgsql as $$
begin
  if new.discount_id is not null then
    if not exists (
      select 1 from public.discounts
       where id = new.discount_id and client_id = new.client_id
    ) then
      raise exception 'discount_id % does not belong to client %', new.discount_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_products_same_tenant_discount
  before insert or update of discount_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_discount();

-- orders_items.product_id
create or replace function public.enforce_same_tenant_order_item_product()
returns trigger language plpgsql as $$
begin
  if new.product_id is not null then
    if not exists (
      select 1 from public.products
       where id = new.product_id and client_id = new.client_id
    ) then
      raise exception 'product_id % does not belong to client %', new.product_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_orders_items_same_tenant_product
  before insert or update of product_id, client_id on public.orders_items
  for each row execute function public.enforce_same_tenant_order_item_product();

-- feedbacks.product_id
create or replace function public.enforce_same_tenant_feedback_product()
returns trigger language plpgsql as $$
begin
  if new.product_id is not null then
    if not exists (
      select 1 from public.products
       where id = new.product_id and client_id = new.client_id
    ) then
      raise exception 'product_id % does not belong to client %', new.product_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_feedbacks_same_tenant_product
  before insert or update of product_id, client_id on public.feedbacks
  for each row execute function public.enforce_same_tenant_feedback_product();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FILE: 09_functions.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ═══════════════════════════════════════════════════════════════════
-- 09 — Tenant-scoped functions (PRD §7)
--   • normalize_phone        — phone-format helper
--   • generate_order_number  — per-client, slug-prefixed
--   • get_orders_by_mobile   — returning customer's orders
--   • get_order_items        — items for one order, mobile-gated
--   • place_order            — creates order with cross-tenant validation
--   • match_products         — vector similarity search (RAG)
-- ═══════════════════════════════════════════════════════════════════

-- ── normalize_phone(p_phone) ───────────────────────────────────────
-- Strips leading '+' and zeros so '+0123' and '00123' both become '123'.
-- Keep aligned with how the bot's save_customer / lookup_customer
-- TypeScript code normalizes phone numbers on the application side.
create or replace function public.normalize_phone(p_phone text)
returns text language sql immutable as $$
  select regexp_replace(coalesce(trim(p_phone), ''), '^\+?0*', '');
$$;

-- ── generate_order_number(p_client_id) ─────────────────────────────
-- Per-client sequence, slug-prefixed: NASSAR-WATCHES-ORD-20260506-0001
create or replace function public.generate_order_number(p_client_id uuid)
returns text language plpgsql as $$
declare
  v_slug   text;
  v_prefix text;
  v_seq    int;
begin
  select upper(slug) into v_slug from public.clients where id = p_client_id;
  if v_slug is null then
    raise exception 'unknown client_id %', p_client_id;
  end if;

  v_prefix := v_slug || '-ORD-' || to_char(now(), 'YYYYMMDD') || '-';

  select count(*) + 1 into v_seq
    from public.orders
   where client_id = p_client_id
     and order_number like v_prefix || '%';

  return v_prefix || lpad(v_seq::text, 4, '0');
end $$;

-- ── get_orders_by_mobile(p_client_id, p_mobile) ────────────────────
create or replace function public.get_orders_by_mobile(
  p_client_id uuid,
  p_mobile    text
) returns table (
  id                      uuid,
  order_number            text,
  customer_first_name     text,
  customer_last_name      text,
  mobile_number           text,
  secondary_mobile_number text,
  city_region             text,
  address                 text,
  shipping_fee            numeric,
  subtotal                numeric,
  total                   numeric,
  payment_method          public.payment_method,
  status                  public.order_status,
  note                    text,
  created_at              timestamptz
) language plpgsql stable as $$
declare
  v_normalised text;
begin
  if p_mobile is null or length(trim(p_mobile)) = 0 then
    return;
  end if;
  v_normalised := public.normalize_phone(p_mobile);

  return query
    select o.id, o.order_number, o.customer_first_name, o.customer_last_name,
           o.mobile_number, o.secondary_mobile_number, o.city_region, o.address,
           o.shipping_fee, o.subtotal, o.total, o.payment_method, o.status,
           o.note, o.created_at
      from public.orders o
     where o.client_id = p_client_id
       and public.normalize_phone(o.mobile_number) = v_normalised
     order by o.created_at desc;
end $$;

-- ── get_order_items(p_client_id, p_order_id, p_mobile) ─────────────
create or replace function public.get_order_items(
  p_client_id uuid,
  p_order_id  uuid,
  p_mobile    text
) returns table (
  id              uuid,
  product_id      uuid,
  product_name    text,
  unit_price      numeric,
  discount_value  numeric,
  quantity        int,
  line_total      numeric,
  variant         jsonb,
  note            text
) language plpgsql stable as $$
declare
  v_normalised  text;
  v_owner_phone text;
begin
  v_normalised := public.normalize_phone(p_mobile);

  -- Order must belong to this client AND this phone must own it.
  select public.normalize_phone(o.mobile_number)
    into v_owner_phone
    from public.orders o
   where o.id = p_order_id and o.client_id = p_client_id;

  if v_owner_phone is null or v_owner_phone <> v_normalised then
    return;
  end if;

  return query
    select oi.id, oi.product_id, oi.product_name, oi.unit_price,
           oi.discount_value, oi.quantity, oi.line_total, oi.variant, oi.note
      from public.orders_items oi
     where oi.order_id  = p_order_id
       and oi.client_id = p_client_id;
end $$;

-- ── place_order(p_client_id, …) ────────────────────────────────────
-- Cross-tenant safety: rejects any product_id that does not belong to
-- the calling client. Client_id is stamped on orders + orders_items.
create or replace function public.place_order(
  p_client_id               uuid,
  p_items                   jsonb,
  p_customer_first_name     text,
  p_customer_last_name      text,
  p_mobile_number           text,
  p_secondary_mobile_number text,
  p_country                 text,
  p_city_region             text,
  p_address                 text,
  p_shipping_fee            numeric,
  p_payment_method          public.payment_method default 'cash_on_delivery',
  p_note                    text default null
) returns public.orders language plpgsql as $$
declare
  v_subtotal     numeric(12,2) := 0;
  v_total        numeric(12,2);
  v_order_number text;
  v_order        public.orders;
  v_item         jsonb;
  v_stock        int;
  v_qty          int;
  v_unit         numeric(10,2);
  v_disc         numeric(5,2);
  v_effective    numeric(12,2);
  v_pid          uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Cross-tenant safety: reject if any product belongs to a different client.
  if exists (
    select 1
      from jsonb_array_elements(p_items) i
      left join public.products p
             on p.id = nullif(i->>'product_id', '')::uuid
     where i->>'product_id' is not null
       and (p.client_id is null or p.client_id <> p_client_id)
  ) then
    raise exception 'order contains products that do not belong to client %', p_client_id;
  end if;

  -- Validate stock and compute subtotal.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := coalesce((v_item->>'quantity')::int, 0);
    v_unit := coalesce((v_item->>'unit_price')::numeric, 0);
    v_disc := coalesce((v_item->>'discount_value')::numeric, 0);
    v_pid  := nullif(v_item->>'product_id', '')::uuid;

    if v_qty <= 0 then
      raise exception 'Invalid quantity for %', v_item->>'product_name';
    end if;

    if v_pid is not null then
      select stock_quantity into v_stock
        from public.products
       where id = v_pid and client_id = p_client_id;

      if v_stock is null then
        raise exception 'Product % no longer exists for this client', v_item->>'product_name';
      end if;
      if v_stock < v_qty then
        raise exception 'Only % in stock for %', v_stock, v_item->>'product_name';
      end if;
    end if;

    v_effective := v_unit * (1 - v_disc / 100);
    v_subtotal  := v_subtotal + v_effective * v_qty;
  end loop;

  v_total        := v_subtotal + coalesce(p_shipping_fee, 0);
  v_order_number := public.generate_order_number(p_client_id);

  insert into public.orders (
    client_id, order_number, customer_first_name, customer_last_name,
    mobile_number, secondary_mobile_number, country, city_region, address,
    shipping_fee, subtotal, total, payment_method, status, note
  ) values (
    p_client_id, v_order_number, p_customer_first_name, p_customer_last_name,
    p_mobile_number, p_secondary_mobile_number, p_country, p_city_region, p_address,
    coalesce(p_shipping_fee, 0), v_subtotal, v_total,
    p_payment_method, 'pending', p_note
  ) returning * into v_order;

  -- Insert items and decrement stock.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := coalesce((v_item->>'quantity')::int, 0);
    v_unit := coalesce((v_item->>'unit_price')::numeric, 0);
    v_disc := coalesce((v_item->>'discount_value')::numeric, 0);
    v_pid  := nullif(v_item->>'product_id', '')::uuid;
    v_effective := v_unit * (1 - v_disc / 100);

    insert into public.orders_items (
      client_id, order_id, product_id, product_name,
      unit_price, discount_value, quantity, line_total, variant, note
    ) values (
      p_client_id, v_order.id, v_pid, v_item->>'product_name',
      v_unit, v_disc, v_qty, v_effective * v_qty,
      coalesce(v_item->'variant', '{}'::jsonb),
      v_item->>'note'
    );

    if v_pid is not null then
      update public.products
         set stock_quantity = greatest(0, stock_quantity - v_qty)
       where id = v_pid
         and client_id = p_client_id;
    end if;
  end loop;

  return v_order;
end $$;

-- ── match_products(p_client_id, p_embedding, p_match_count) ────────
-- Vector similarity search, scoped per tenant.
create or replace function public.match_products(
  p_client_id   uuid,
  p_embedding   vector(1536),
  p_match_count int default 5
) returns table (
  product_id uuid,
  similarity float,
  content    text
) language sql stable as $$
  select pe.product_id,
         1 - (pe.embedding <=> p_embedding) as similarity,
         pe.content
    from public.product_embeddings pe
   where pe.client_id = p_client_id
   order by pe.embedding <=> p_embedding
   limit p_match_count;
$$;

