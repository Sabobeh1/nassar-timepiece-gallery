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
