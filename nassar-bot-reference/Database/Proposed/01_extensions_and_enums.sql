-- ═══════════════════════════════════════════════════════════════════
-- 01 — Extensions & enums
-- Run this FIRST. All tables and functions depend on it.
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";  -- legacy uuid_generate_v4(); kept for compat
create extension if not exists pgcrypto;     -- gen_random_uuid()
create extension if not exists vector;       -- pgvector for product embeddings

-- ── Enums (USER-DEFINED types from existing schema) ───────────────
-- Adjust values to match your business needs before running.

do $$ begin
  create type public.announcement_type as enum ('text', 'image', 'mixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum (
    'cash_on_delivery', 'card', 'bank_transfer'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending', 'confirmed', 'preparing', 'shipped',
    'delivered', 'cancelled', 'returned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.layout_name as enum ('classic', 'modern', 'minimal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.theme_name as enum ('light', 'dark', 'auto');
exception when duplicate_object then null; end $$;
