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
