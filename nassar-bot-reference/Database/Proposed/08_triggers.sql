-- ═══════════════════════════════════════════════════════════════════
-- 08 — Triggers
--   • set_updated_at — touch updated_at on every UPDATE
--   • set_product_number — assign per-client product_number on INSERT
--   • Same-tenant FK guards (PRD §6.5)
-- ═══════════════════════════════════════════════════════════════════

-- ── set_updated_at — generic helper ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_business_profile_set_updated_at
  before update on public.business_profile
  for each row execute function public.set_updated_at();

create trigger trg_site_configuration_set_updated_at
  before update on public.site_configuration
  for each row execute function public.set_updated_at();

-- ── set_product_number — per-client auto-increment ─────────────────
create or replace function public.set_product_number()
returns trigger language plpgsql as $$
begin
  if new.product_number is null then
    select coalesce(max(product_number), 0) + 1
      into new.product_number
      from public.products
     where client_id = new.client_id;
  end if;
  return new;
end $$;

create trigger trg_products_set_number
  before insert on public.products
  for each row execute function public.set_product_number();

-- ── Same-tenant FK guards (PRD §6.5) ───────────────────────────────
-- Without these, tenant A could insert a product referencing tenant B's
-- category. Triggers raise on any cross-tenant reference.

-- products.category_id
create or replace function public.enforce_same_tenant_product_category()
returns trigger language plpgsql as $$
begin
  if new.category_id is not null then
    if not exists (
      select 1 from public.categories
       where id = new.category_id and client_id = new.client_id
    ) then
      raise exception 'category_id % does not belong to client %', new.category_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_products_same_tenant_category
  before insert or update of category_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_category();

-- products.brand_id
create or replace function public.enforce_same_tenant_product_brand()
returns trigger language plpgsql as $$
begin
  if new.brand_id is not null then
    if not exists (
      select 1 from public.brands
       where id = new.brand_id and client_id = new.client_id
    ) then
      raise exception 'brand_id % does not belong to client %', new.brand_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_products_same_tenant_brand
  before insert or update of brand_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_brand();

-- products.discount_id
create or replace function public.enforce_same_tenant_product_discount()
returns trigger language plpgsql as $$
begin
  if new.discount_id is not null then
    if not exists (
      select 1 from public.discounts
       where id = new.discount_id and client_id = new.client_id
    ) then
      raise exception 'discount_id % does not belong to client %', new.discount_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_products_same_tenant_discount
  before insert or update of discount_id, client_id on public.products
  for each row execute function public.enforce_same_tenant_product_discount();

-- orders_items.product_id
create or replace function public.enforce_same_tenant_order_item_product()
returns trigger language plpgsql as $$
begin
  if new.product_id is not null then
    if not exists (
      select 1 from public.products
       where id = new.product_id and client_id = new.client_id
    ) then
      raise exception 'product_id % does not belong to client %', new.product_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_orders_items_same_tenant_product
  before insert or update of product_id, client_id on public.orders_items
  for each row execute function public.enforce_same_tenant_order_item_product();

-- feedbacks.product_id
create or replace function public.enforce_same_tenant_feedback_product()
returns trigger language plpgsql as $$
begin
  if new.product_id is not null then
    if not exists (
      select 1 from public.products
       where id = new.product_id and client_id = new.client_id
    ) then
      raise exception 'product_id % does not belong to client %', new.product_id, new.client_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_feedbacks_same_tenant_product
  before insert or update of product_id, client_id on public.feedbacks
  for each row execute function public.enforce_same_tenant_feedback_product();
