-- ═══════════════════════════════════════════════════════════════════
-- PRODUCT EMBEDDINGS STORE (RAG)
-- One row per product; filterable by category_id via metadata.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists vector;

drop table if exists product_embeddings cascade;
create table product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(512) not null,
  created_at timestamptz not null default now(),
  unique (product_id)
);

create index product_embeddings_ivfflat
  on product_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index product_embeddings_metadata_gin
  on product_embeddings using gin (metadata);

drop function if exists match_product_embeddings(vector, integer, jsonb);
create or replace function match_product_embeddings (
  query_embedding vector(512),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
) returns table (
  id uuid,
  product_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    p.id,
    p.product_id,
    p.content,
    p.metadata,
    1 - (p.embedding <=> query_embedding) as similarity
  from product_embeddings p
  where p.metadata @> filter
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RLS: service-role bypasses; anon cannot read raw vectors.
alter table product_embeddings enable row level security;
