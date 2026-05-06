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
