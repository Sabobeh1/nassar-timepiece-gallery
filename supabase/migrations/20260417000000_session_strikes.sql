-- Strike tracking + tiered ban escalation for session_bans.
-- A row may now exist with no active ban (banned_until NULL) just to track strikes.

alter table public.session_bans
  alter column banned_until drop not null;

alter table public.session_bans
  add column if not exists strike_count    int         not null default 0,
  add column if not exists ban_count       int         not null default 0,
  add column if not exists last_strike_at  timestamptz null;
