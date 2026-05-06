generate_order_number:
declare
  prefix text := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-';
  next_seq int;
begin
  select count(*) + 1 into next_seq
  from public.orders
  where order_number like prefix || '%';
  return prefix || lpad(next_seq::text, 4, '0');
end 
====
get_order_items:

declare
  normalised text;
  owner_mobile text;
begin
  normalised := regexp_replace(coalesce(trim(p_mobile), ''), '^\+?0*', '');
  select regexp_replace(o.mobile_number, '^\+?0*', '') into owner_mobile
  from public.orders o where o.id = p_order_id;
  if owner_mobile is null or owner_mobile <> normalised then
    return;
  end if;
  return query
    select oi.id, oi.product_id, oi.product_name, oi.unit_price,
           oi.discount_value, oi.quantity, oi.line_total, oi.variant, oi.note
    from public.orders_items oi
    where oi.order_id = p_order_id;
end 
=============
get_orders_by_mobile:

declare
  normalised text;
begin
  if p_mobile is null or length(trim(p_mobile)) = 0 then
    return;
  end if;
  normalised := regexp_replace(trim(p_mobile), '^\+?0*', '');
  return query
    select o.id, o.order_number, o.customer_first_name, o.customer_last_name,
           o.mobile_number, o.secondary_mobile_number, o.city_region, o.address,
           o.shipping_fee, o.subtotal, o.total, o.payment_method, o.status,
           o.note, o.created_at
    from public.orders o
    where regexp_replace(o.mobile_number, '^\+?0*', '') = normalised
    order by o.created_at desc;
end 

=======
place_order:

declare
  v_subtotal        numeric(12,2) := 0;
  v_total           numeric(12,2);
  v_order_number    text;
  v_order           public.orders;
  v_item            jsonb;
  v_stock           integer;
  v_qty             integer;
  v_unit            numeric(10,2);
  v_disc            numeric(5,2);
  v_effective       numeric(12,2);
  v_pid             uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
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
      select stock_quantity into v_stock from public.products where id = v_pid;
      if v_stock is null then
        raise exception 'Product % no longer exists', v_item->>'product_name';
      end if;
      if v_stock < v_qty then
        raise exception 'Only % in stock for %', v_stock, v_item->>'product_name';
      end if;
    end if;

    v_effective := v_unit * (1 - v_disc / 100);
    v_subtotal  := v_subtotal + v_effective * v_qty;
  end loop;

  v_total        := v_subtotal + coalesce(p_shipping_fee, 0);
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, customer_first_name, customer_last_name,
    mobile_number, secondary_mobile_number, country, city_region, address,
    shipping_fee, subtotal, total, payment_method, status, note
  ) values (
    v_order_number, p_customer_first_name, p_customer_last_name,
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
      order_id, product_id, product_name,
      unit_price, discount_value, quantity, line_total, variant, note
    ) values (
      v_order.id, v_pid, v_item->>'product_name',
      v_unit, v_disc, v_qty, v_effective * v_qty,
      coalesce(v_item->'variant', '{}'::jsonb),
      v_item->>'note'
    );

    if v_pid is not null then
      update public.products
         set stock_quantity = greatest(0, stock_quantity - v_qty)
       where id = v_pid;
    end if;
  end loop;

  return v_order;
end 
==========
rls_auto_enable:

DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
==========
set_updated_at:

begin
  new.updated_at = now();
  return new;
end 
