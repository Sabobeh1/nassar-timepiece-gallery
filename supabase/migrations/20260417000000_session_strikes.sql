-- Strike tracking + tiered ban escalation for session_bans.
-- A row may now exist with no active ban (banned_until NULL) just to track strikes.

alter table public.session_bans
  alter column banned_until drop not null;

alter table public.session_bans
  add column if not exists strike_count     int         not null default 0,
  add column if not exists ban_count        int         not null default 0,
  add column if not exists last_strike_at   timestamptz null,
  -- Length-based warning state (independent of the abuse strike system).
  -- true once the user has been warned about an over-500-char message;
  -- a second over-500-char message while still true triggers a length ban.
  add column if not exists long_msg_warned  boolean     not null default false;
