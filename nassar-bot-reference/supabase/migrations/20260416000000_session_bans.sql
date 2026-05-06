-- Session bans table for rate-limiting and abuse prevention
create table if not exists public.session_bans (
  session_id text not null,
  banned_until timestamp with time zone not null,
  reason text null,
  created_at timestamp with time zone not null default now(),
  constraint session_bans_pkey primary key (session_id)
) tablespace pg_default;

-- Auto-cleanup: delete expired bans (optional — can also be done via cron)
create index if not exists idx_session_bans_until
  on public.session_bans using btree (banned_until) tablespace pg_default;

-- RLS: only service_role can access
alter table public.session_bans enable row level security;
