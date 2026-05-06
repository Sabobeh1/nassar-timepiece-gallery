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
