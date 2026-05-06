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
