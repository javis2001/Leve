-- ════════════════════════════════════════════════════════════════════
-- Processamento atômico de eventos de pagamento.
-- Chamado apenas pelo servidor (service role) a partir do webhook validado.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.process_payment_event(
  p_provider text,
  p_provider_order_id text,
  p_email text,
  p_customer_name text,
  p_status text,
  p_amount_cents integer,
  p_utm jsonb,
  p_event_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_prev text;
  v_allowed boolean := false;
  v_first_paid boolean := false;
  v_email text := lower(trim(p_email));
  v_user uuid;
begin
  if p_status not in ('pending', 'paid', 'refused', 'refunded', 'chargeback', 'canceled') then
    raise exception 'Status inválido: %', p_status;
  end if;
  if v_email is null or v_email = '' then
    raise exception 'E-mail obrigatório';
  end if;

  select * into v_order from public.orders
   where provider = p_provider and provider_order_id = p_provider_order_id
   for update;

  if not found then
    insert into public.orders (provider, provider_order_id, email, customer_name, status, amount_cents, utm)
    values (p_provider, p_provider_order_id, v_email, p_customer_name, p_status, p_amount_cents, coalesce(p_utm, '{}'::jsonb))
    returning * into v_order;
    v_prev := null;
    v_allowed := true;
  else
    v_prev := v_order.status;
    -- Transições permitidas (eventos fora de ordem não reativam acesso após reembolso)
    v_allowed := case
      when v_prev = p_status then false
      when v_prev in ('pending', 'refused') then true
      when v_prev = 'paid' and p_status in ('refunded', 'chargeback', 'canceled') then true
      else false
    end;
    if v_allowed then
      update public.orders
         set status = p_status,
             amount_cents = coalesce(p_amount_cents, amount_cents),
             customer_name = coalesce(p_customer_name, customer_name),
             utm = case when utm = '{}'::jsonb then coalesce(p_utm, '{}'::jsonb) else utm end
       where id = v_order.id
       returning * into v_order;
    end if;
  end if;

  if v_allowed then
    insert into public.order_events (order_id, from_status, to_status, event_type)
    values (v_order.id, v_prev, p_status, coalesce(p_event_type, p_status));

    if p_status = 'paid' then
      select id into v_user from public.profiles where lower(email) = v_email limit 1;
      if not exists (select 1 from public.entitlements where order_id = v_order.id) then
        insert into public.entitlements (email, user_id, status, source, order_id)
        values (v_email, v_user, 'active', 'checkout', v_order.id);
      else
        update public.entitlements set status = 'active' where order_id = v_order.id;
      end if;
      if v_order.purchase_tracked_at is null then
        update public.orders set purchase_tracked_at = now() where id = v_order.id;
        v_first_paid := true;
      end if;
    elsif p_status in ('refunded', 'chargeback', 'canceled') then
      update public.entitlements set status = p_status where order_id = v_order.id;
    end if;
  end if;

  return jsonb_build_object(
    'order_id', v_order.id,
    'previous_status', v_prev,
    'status', v_order.status,
    'changed', v_allowed,
    'first_paid', v_first_paid
  );
end;
$$;

revoke all on function public.process_payment_event(text, text, text, text, text, integer, jsonb, text) from public, anon, authenticated;
grant execute on function public.process_payment_event(text, text, text, text, text, integer, jsonb, text) to service_role;
