-- 2026-10-23
-- Paddle: identidad del cliente, registro de eventos y devoluciones.
--
-- Paddle es el vendedor (merchant of record): cobra el IVA, emite la factura y
-- nos avisa por webhook. Aquí solo se guarda lo necesario para acreditar y para
-- poder cuadrar después:
--
--   profiles.paddle_customer_id      → abrir el portal del cliente y casar avisos
--   profiles.paddle_subscription_id  → qué suscripción tiene cada cuenta
--   paddle_events                    → qué avisos han llegado (auditoría y depuración)
--   refund_credits()                 → devoluciones: add_credits solo suma
--
-- Nada de esto lo puede escribir el navegador: el saldo y estos campos los toca
-- solo la Edge Function con service_role. El trigger de privilegios los protege.

-- ---------------------------------------------------------------------------
-- 1. Vínculo con Paddle
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text;

create unique index if not exists profiles_paddle_customer_unique
  on public.profiles (paddle_customer_id)
  where paddle_customer_id is not null;

create unique index if not exists profiles_paddle_subscription_unique
  on public.profiles (paddle_subscription_id)
  where paddle_subscription_id is not null;

comment on column public.profiles.paddle_customer_id is
  'ID de cliente en Paddle (ctm_...). Solo service_role.';
comment on column public.profiles.paddle_subscription_id is
  'Suscripción activa en Paddle (sub_...). Solo service_role.';

-- ---------------------------------------------------------------------------
-- 2. El trigger también tiene que proteger estos campos
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    'direct'
  );

  if v_role not in ('service_role', 'postgres', 'supabase_admin', 'direct') then
    new.is_premium           := old.is_premium;
    new.premium_until        := old.premium_until;
    new.role                 := old.role;
    new.email                := old.email;
    new.credits              := old.credits;
    new.paddle_customer_id   := old.paddle_customer_id;
    new.paddle_subscription_id := old.paddle_subscription_id;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Registro de avisos recibidos
-- ---------------------------------------------------------------------------
create table if not exists public.paddle_events (
    -- `event_id` de Paddle (evt_...): la misma entrega no se procesa dos veces.
    id text primary key,
    event_type text not null,
    occurred_at timestamptz,
    received_at timestamptz not null default now(),
    payload jsonb
);

alter table public.paddle_events enable row level security;
-- Sin políticas: solo service_role (que ignora RLS) escribe y lee aquí.

create index if not exists paddle_events_type_idx
    on public.paddle_events (event_type, received_at desc);

comment on table public.paddle_events is
    'Avisos de Paddle recibidos, para auditar y depurar. Sin acceso desde el navegador.';

-- ---------------------------------------------------------------------------
-- 4. Devoluciones
-- ---------------------------------------------------------------------------
-- add_credits solo suma. Una devolución (adjustment.created con action=refund)
-- tiene que restar sin dejar el saldo en negativo y sin aplicar dos veces el
-- mismo ajuste.
create or replace function public.refund_credits(
    p_user uuid,
    p_amount integer,
    p_reason text default 'refund',
    p_ref text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_prev integer;
    v_new integer;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'p_amount debe ser mayor que 0';
    end if;

    -- ¿Ya se aplicó esta devolución?
    if p_ref is not null then
        select p.credits into v_new
          from public.profiles p
         where p.id = p_user
           and exists (select 1 from public.credit_movements m where m.ref = p_ref);
        if v_new is not null then
            return v_new;
        end if;
    end if;

    select credits into v_prev from public.profiles where id = p_user;
    if v_prev is null then
        raise exception 'no existe el perfil %', p_user;
    end if;

    -- Nunca por debajo de 0: si ya gastó parte, se quita lo que quede.
    v_new := greatest(v_prev - p_amount, 0);
    update public.profiles set credits = v_new where id = p_user;

    if v_new <> v_prev then
        insert into public.credit_movements (user_id, delta, reason, ref, balance_after)
        values (p_user, v_new - v_prev, p_reason, p_ref, v_new);
    end if;

    return v_new;
end;
$$;

revoke all on function public.refund_credits(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.refund_credits(uuid, integer, text, text) to service_role;

comment on function public.refund_credits(uuid, integer, text, text) is
    'Resta consultas (devolución) sin bajar de 0 e idempotente por ref. Solo service_role.';
