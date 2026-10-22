-- add_credits idempotente por `ref`.
--
-- Un webhook de pago (Lemon Squeezy, Paddle, Ko-fi...) puede reintentar la misma
-- entrega varias veces: si se suma el saldo dos veces, el usuario recibe el doble
-- de consultas y el fallo es invisible. Con `ref` única (p. ej. `ls:<order_id>`)
-- la segunda llamada devuelve el saldo actual sin sumar nada.

create or replace function public.add_credits(
    p_user uuid,
    p_amount integer,
    p_reason text default 'manual',
    p_ref text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_new integer;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'p_amount debe ser mayor que 0';
    end if;

    -- ¿Ya se aplicó este movimiento? Devuelve el saldo sin tocar nada.
    if p_ref is not null then
        select p.credits into v_new
          from public.profiles p
         where p.id = p_user
           and exists (select 1 from public.credit_movements m where m.ref = p_ref);
        if v_new is not null then
            return v_new;
        end if;
    end if;

    update public.profiles
       set credits = credits + p_amount
     where id = p_user
    returning credits into v_new;

    if v_new is null then
        raise exception 'no existe el perfil %', p_user;
    end if;

    insert into public.credit_movements (user_id, delta, reason, ref, balance_after)
    values (p_user, p_amount, p_reason, p_ref, v_new);

    return v_new;
end;
$$;

revoke all on function public.add_credits(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.add_credits(uuid, integer, text, text) to service_role;

-- Un `ref` no se puede repetir: si un webhook llega con el mismo pedido, es el
-- mismo pago. (Los movimientos sin ref no entran en la restricción.)
create unique index if not exists credit_movements_ref_unique
    on public.credit_movements (ref)
    where ref is not null;
