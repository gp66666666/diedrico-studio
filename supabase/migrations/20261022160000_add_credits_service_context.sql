-- add_credits dentro de funciones llamadas por un usuario.
--
-- El trigger `protect_profile_privileges` restaura `credits` si quien actualiza
-- no es service_role. Cuando `redeem_class_code` (security definer, ejecutada por
-- un alumno autenticado) llama a add_credits, el trigger ve el rol `authenticated`
-- y deja el saldo a cero: la RPC decía "ok" pero no acreditaba nada.
--
-- Solución: add_credits se declara a sí misma como contexto de servicio mientras
-- toca el saldo, y restaura las claims al terminar.

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
    v_claims text;
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

    v_claims := current_setting('request.jwt.claims', true);
    perform set_config('request.jwt.claims', '{"role":"service_role"}', true);

    update public.profiles
       set credits = credits + p_amount
     where id = p_user
    returning credits into v_new;

    if v_new is null then
        raise exception 'no existe el perfil %', p_user;
    end if;

    insert into public.credit_movements (user_id, delta, reason, ref, balance_after)
    values (p_user, p_amount, p_reason, p_ref, v_new);

    perform set_config('request.jwt.claims', coalesce(v_claims, ''), true);

    return v_new;
end;
$$;

revoke all on function public.add_credits(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.add_credits(uuid, integer, text, text) to service_role;
