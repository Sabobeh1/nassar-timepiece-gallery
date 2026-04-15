-- ═══════════════════════════════════════════════════════════════════
-- BOT CORE: customer info store, chat history, SQL view for agent
-- (products.quantity already exists — do not add stock_quantity)
-- ═══════════════════════════════════════════════════════════════════

-- 1) users_info — returning customer delivery details (phone is the key)
create table if not exists users_info (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  first_name text,
  last_name text,
  country text,
  region text,
  city text,
  address text,
  postal_code text,
  channel text check (channel in ('web','telegram')),
  channel_user_id text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists users_info_channel_idx
  on users_info (channel, channel_user_id);

-- 2) chat_messages — agent memory (session_id is "web:<uuid>" or "tg:<chat_id>")
create table if not exists chat_messages (
  session_id text not null,
  idx int not null,
  message jsonb not null,
  created_at timestamptz not null default now(),
  primary key (session_id, idx)
);

-- 3) products_metadata view — what the inventory_check tool reads.
--    Exposes products.quantity as stock_quantity so the agent code stays schema-neutral.
create or replace view products_metadata as
  select
    p.id,
    p.name,
    p.description,
    p.price,
    p.quantity      as stock_quantity,
    p.category_id,
    c.name          as category_name
  from products p
  left join categories c on c.id = p.category_id;

-- 4) RLS: service_role bypasses; lock anon out of chat_messages and users_info
alter table users_info      enable row level security;
alter table chat_messages   enable row level security;
