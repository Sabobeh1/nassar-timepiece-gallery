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
