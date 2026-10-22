-- 2026-10-22
-- Créditos de consultas al asistente (prepago).
--
-- El saldo vive en profiles.credits. Cada cambio queda registrado en
-- credit_movements (compra, consumo, devolución, ajuste a mano), para poder
-- cuadrar el margen y la reserva de la API.
--
-- El cliente NO puede escribir ni el saldo ni los movimientos: solo se tocan
-- desde la Edge Function con service_role, a través de add_credits /
-- spend_credit. El trigger de privilegios restaura `credits` si un usuario
-- intenta cambiarlo desde el navegador.

alter table public.profiles
  add column if not exists credits integer not null default 0;

do $$
begin
  alter table public.profiles
    add constraint profiles_credits_non_negative check (credits >= 0);
exception
  when duplicate_object then null;
end $$;

comment on column public.profiles.credits is
  'Consultas de IA prepagadas. Solo service_role las modifica (rpc add_credits / spend_credit).';

-- ---------------------------------------------------------------------------
-- El trigger existente también tiene que proteger el saldo
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
    new.is_premium    := old.is_premium;
    new.premium_until := old.premium_until;
    new.role          := old.role;
    new.email         := old.email;
    new.credits       := old.credits;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Movimientos
-- ---------------------------------------------------------------------------
create table if not exists public.credit_movements (
    id bigserial primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    delta integer not null,
    reason text not null,           -- purchase | ai_message | refund | manual | bonus
    ref text,                       -- id del pago (Stripe/Ko-fi) o del mensaje
    balance_after integer not null,
    created_at timestamptz not null default now()
);

alter table public.credit_movements enable row level security;

create index if not exists credit_movements_user_idx
    on public.credit_movements (user_id, created_at desc);
create index if not exists credit_movements_reason_idx
    on public.credit_movements (reason, created_at desc);

drop policy if exists "own credit movements" on public.credit_movements;
create policy "own credit movements"
    on public.credit_movements for select
    to authenticated
    using (user_id = auth.uid());

comment on table public.credit_movements is
    'Libro de créditos: + compra / devolución, − consumo. balance_after es el saldo tras el movimiento.';

-- ---------------------------------------------------------------------------
-- Gasto atómico de un crédito (lo llama ai-proxy)
-- ---------------------------------------------------------------------------
create or replace function public.spend_credit(
    p_user uuid,
    p_reason text default 'ai_message',
    p_ref text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_left integer;
begin
  update public.profiles
     set credits = credits - 1
   where id = p_user
     and credits > 0
  returning credits into v_left;

  if v_left is null then
    return null;   -- sin saldo (o usuario inexistente)
  end if;

  insert into public.credit_movements (user_id, delta, reason, ref, balance_after)
  values (p_user, -1, p_reason, p_ref, v_left);

  return v_left;
end;
$$;

revoke all on function public.spend_credit(uuid, text, text) from public, anon, authenticated;
grant execute on function public.spend_credit(uuid, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- Abono de créditos (compra, devolución o ajuste manual)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Resumen para el panel de administración: cuánto hay que reservar para la API
-- ---------------------------------------------------------------------------
create or replace function public.credit_snapshot(
    p_price_per_credit numeric default 0.05,
    p_cost_per_credit numeric default 0.01
)
returns table (
    credits_sold bigint,
    credits_spent bigint,
    credits_balance bigint,
    users_with_credits bigint,
    gross_eur numeric,
    reserve_eur numeric,
    margin_eur numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
     where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'solo el administrador puede ver el resumen de créditos';
  end if;

  return query
  with mov as (
    select
      coalesce(sum(delta) filter (where delta > 0), 0)::bigint as sold,
      coalesce(-sum(delta) filter (where delta < 0), 0)::bigint as spent
    from public.credit_movements
  )
  select
    mov.sold,
    mov.spent,
    (select coalesce(sum(credits), 0)::bigint from public.profiles),
    (select count(*)::bigint from public.profiles where credits > 0),
    round(mov.sold * p_price_per_credit, 2),
    round(mov.sold * p_cost_per_credit, 2),
    round(mov.sold * (p_price_per_credit - p_cost_per_credit), 2)
  from mov;
end;
$$;

revoke all on function public.credit_snapshot(numeric, numeric) from public, anon;
grant execute on function public.credit_snapshot(numeric, numeric) to authenticated;
