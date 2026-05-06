-- ═══════════════════════════════════════════════════════════════════
-- 09 — Tenant-scoped functions (PRD §7)
--   • normalize_phone        — phone-format helper
--   • generate_order_number  — per-client, slug-prefixed
--   • get_orders_by_mobile   — returning customer's orders
--   • get_order_items        — items for one order, mobile-gated
--   • place_order            — creates order with cross-tenant validation
--   • match_products         — vector similarity search (RAG)
-- ═══════════════════════════════════════════════════════════════════

-- ── normalize_phone(p_phone) ───────────────────────────────────────
-- Strips leading '+' and zeros so '+0123' and '00123' both become '123'.
-- Keep aligned with how the bot's save_customer / lookup_customer
-- TypeScript code normalizes phone numbers on the application side.
create or replace function public.normalize_phone(p_phone text)
returns text language sql immutable as $$
  select regexp_replace(coalesce(trim(p_phone), ''), '^\+?0*', '');
$$;

-- ── generate_order_number(p_client_id) ─────────────────────────────
-- Per-client sequence, slug-prefixed: NASSAR-WATCHES-ORD-20260506-0001
create or replace function public.generate_order_number(p_client_id uuid)
returns text language plpgsql as $$
declare
  v_slug   text;
  v_prefix text;
  v_seq    int;
begin
  select upper(slug) into v_slug from public.clients where id = p_client_id;
  if v_slug is null then
    raise exception 'unknown client_id %', p_client_id;
  end if;

  v_prefix := v_slug || '-ORD-' || to_char(now(), 'YYYYMMDD') || '-';

  select count(*) + 1 into v_seq
    from public.orders
   where client_id = p_client_id
     and order_number like v_prefix || '%';

  return v_prefix || lpad(v_seq::text, 4, '0');
end $$;

-- ── get_orders_by_mobile(p_client_id, p_mobile) ────────────────────
create or replace function public.get_orders_by_mobile(
  p_client_id uuid,
  p_mobile    text
) returns table (
  id                      uuid,
  order_number            text,
  customer_first_name     text,
  customer_last_name      text,
  mobile_number           text,
  secondary_mobile_number text,
  city_region             text,
  address                 text,
  shipping_fee            numeric,
  subtotal                numeric,
  total                   numeric,
  payment_method          public.payment_method,
  status                  public.order_status,
  note                    text,
  created_at              timestamptz
) language plpgsql stable as $$
declare
  v_normalised text;
begin
  if p_mobile is null or length(trim(p_mobile)) = 0 then
    return;
  end if;
  v_normalised := public.normalize_phone(p_mobile);

  return query
    select o.id, o.order_number, o.customer_first_name, o.customer_last_name,
           o.mobile_number, o.secondary_mobile_number, o.city_region, o.address,
           o.shipping_fee, o.subtotal, o.total, o.payment_method, o.status,
           o.note, o.created_at
      from public.orders o
     where o.client_id = p_client_id
       and public.normalize_phone(o.mobile_number) = v_normalised
     order by o.created_at desc;
end $$;

-- ── get_order_items(p_client_id, p_order_id, p_mobile) ─────────────
create or replace function public.get_order_items(
  p_client_id uuid,
  p_order_id  uuid,
  p_mobile    text
) returns table (
  id              uuid,
  product_id      uuid,
  product_name    text,
  unit_price      numeric,
  discount_value  numeric,
  quantity        int,
  line_total      numeric,
  variant         jsonb,
  note            text
) language plpgsql stable as $$
declare
  v_normalised  text;
  v_owner_phone text;
begin
  v_normalised := public.normalize_phone(p_mobile);

  -- Order must belong to this client AND this phone must own it.
  select public.normalize_phone(o.mobile_number)
    into v_owner_phone
    from public.orders o
   where o.id = p_order_id and o.client_id = p_client_id;

  if v_owner_phone is null or v_owner_phone <> v_normalised then
    return;
  end if;

  return query
    select oi.id, oi.product_id, oi.product_name, oi.unit_price,
           oi.discount_value, oi.quantity, oi.line_total, oi.variant, oi.note
      from public.orders_items oi
     where oi.order_id  = p_order_id
       and oi.client_id = p_client_id;
end $$;

-- ── place_order(p_client_id, …) ────────────────────────────────────
-- Cross-tenant safety: rejects any product_id that does not belong to
-- the calling client. Client_id is stamped on orders + orders_items.
create or replace function public.place_order(
  p_client_id               uuid,
  p_items                   jsonb,
  p_customer_first_name     text,
  p_customer_last_name      text,
  p_mobile_number           text,
  p_secondary_mobile_number text,
  p_country                 text,
  p_city_region             text,
  p_address                 text,
  p_shipping_fee            numeric,
  p_payment_method          public.payment_method default 'cash_on_delivery',
  p_note                    text default null
) returns public.orders language plpgsql as $$
declare
  v_subtotal     numeric(12,2) := 0;
  v_total        numeric(12,2);
  v_order_number text;
  v_order        public.orders;
  v_item         jsonb;
  v_stock        int;
  v_qty          int;
  v_unit         numeric(10,2);
  v_disc         numeric(5,2);
  v_effective    numeric(12,2);
  v_pid          uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Cross-tenant safety: reject if any product belongs to a different client.
  if exists (
    select 1
      from jsonb_array_elements(p_items) i
      left join public.products p
             on p.id = nullif(i->>'product_id', '')::uuid
     where i->>'product_id' is not null
       and (p.client_id is null or p.client_id <> p_client_id)
  ) then
    raise exception 'order contains products that do not belong to client %', p_client_id;
  end if;

  -- Validate stock and compute subtotal.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := coalesce((v_item->>'quantity')::int, 0);
    v_unit := coalesce((v_item->>'unit_price')::numeric, 0);
    v_disc := coalesce((v_item->>'discount_value')::numeric, 0);
    v_pid  := nullif(v_item->>'product_id', '')::uuid;

    if v_qty <= 0 then
      raise exception 'Invalid quantity for %', v_item->>'product_name';
    end if;

    if v_pid is not null then
      select stock_quantity into v_stock
        from public.products
       where id = v_pid and client_id = p_client_id;

      if v_stock is null then
        raise exception 'Product % no longer exists for this client', v_item->>'product_name';
      end if;
      if v_stock < v_qty then
        raise exception 'Only % in stock for %', v_stock, v_item->>'product_name';
      end if;
    end if;

    v_effective := v_unit * (1 - v_disc / 100);
    v_subtotal  := v_subtotal + v_effective * v_qty;
  end loop;

  v_total        := v_subtotal + coalesce(p_shipping_fee, 0);
  v_order_number := public.generate_order_number(p_client_id);

  insert into public.orders (
    client_id, order_number, customer_first_name, customer_last_name,
    mobile_number, secondary_mobile_number, country, city_region, address,
    shipping_fee, subtotal, total, payment_method, status, note
  ) values (
    p_client_id, v_order_number, p_customer_first_name, p_customer_last_name,
    p_mobile_number, p_secondary_mobile_number, p_country, p_city_region, p_address,
    coalesce(p_shipping_fee, 0), v_subtotal, v_total,
    p_payment_method, 'pending', p_note
  ) returning * into v_order;

  -- Insert items and decrement stock.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := coalesce((v_item->>'quantity')::int, 0);
    v_unit := coalesce((v_item->>'unit_price')::numeric, 0);
    v_disc := coalesce((v_item->>'discount_value')::numeric, 0);
    v_pid  := nullif(v_item->>'product_id', '')::uuid;
    v_effective := v_unit * (1 - v_disc / 100);

    insert into public.orders_items (
      client_id, order_id, product_id, product_name,
      unit_price, discount_value, quantity, line_total, variant, note
    ) values (
      p_client_id, v_order.id, v_pid, v_item->>'product_name',
      v_unit, v_disc, v_qty, v_effective * v_qty,
      coalesce(v_item->'variant', '{}'::jsonb),
      v_item->>'note'
    );

    if v_pid is not null then
      update public.products
         set stock_quantity = greatest(0, stock_quantity - v_qty)
       where id = v_pid
         and client_id = p_client_id;
    end if;
  end loop;

  return v_order;
end $$;

-- ── match_products(p_client_id, p_embedding, p_match_count) ────────
-- Vector similarity search, scoped per tenant.
create or replace function public.match_products(
  p_client_id   uuid,
  p_embedding   vector(1536),
  p_match_count int default 5
) returns table (
  product_id uuid,
  similarity float,
  content    text
) language sql stable as $$
  select pe.product_id,
         1 - (pe.embedding <=> p_embedding) as similarity,
         pe.content
    from public.product_embeddings pe
   where pe.client_id = p_client_id
   order by pe.embedding <=> p_embedding
   limit p_match_count;
$$;
