-- Códigos de clase (Pack Profesor).
--
-- El profesor compra un pack y recibe un código. Cada alumno que lo canjea
-- recibe X consultas en SU cuenta (no hay bote compartido: nadie puede gastar
-- las de otro y el profesor no tiene que administrar nada).
--
-- El coste queda acotado por el propio código: `credits_per_student × max_uses`.

create table if not exists public.class_codes (
    code text primary key,
    owner_id uuid not null references auth.users (id) on delete cascade,
    credits_per_student integer not null check (credits_per_student between 1 and 500),
    max_uses integer not null check (max_uses between 1 and 200),
    uses integer not null default 0 check (uses >= 0),
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    -- Pedido de Lemon Squeezy que lo generó: evita dos códigos por el mismo pago.
    order_ref text unique
);

create index if not exists class_codes_owner_idx on public.class_codes (owner_id);

create table if not exists public.class_code_uses (
    code text not null references public.class_codes (code) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (code, user_id)
);

alter table public.class_codes enable row level security;
alter table public.class_code_uses enable row level security;

-- El profesor ve sus códigos. El alumno ve los que ha usado.
drop policy if exists "class_codes_select_own" on public.class_codes;
create policy "class_codes_select_own" on public.class_codes
    for select using (auth.uid() = owner_id);

drop policy if exists "class_code_uses_select_own" on public.class_code_uses;
create policy "class_code_uses_select_own" on public.class_code_uses
    for select using (auth.uid() = user_id);

-- Nadie escribe desde el navegador: los crea el webhook y los canjea la función.

create or replace function public.redeem_class_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
    v_code public.class_codes%rowtype;
    v_balance integer;
begin
    if v_user is null then
        return jsonb_build_object('ok', false, 'reason', 'login_required');
    end if;

    select * into v_code
      from public.class_codes
     where code = upper(trim(p_code))
       for update;

    if not found then
        return jsonb_build_object('ok', false, 'reason', 'not_found');
    end if;
    if v_code.expires_at < now() then
        return jsonb_build_object('ok', false, 'reason', 'expired');
    end if;
    if v_code.uses >= v_code.max_uses then
        return jsonb_build_object('ok', false, 'reason', 'full');
    end if;
    if exists (select 1 from public.class_code_uses u where u.code = v_code.code and u.user_id = v_user) then
        return jsonb_build_object('ok', false, 'reason', 'already_used');
    end if;

    insert into public.class_code_uses (code, user_id) values (v_code.code, v_user);
    update public.class_codes set uses = uses + 1 where code = v_code.code;

    v_balance := public.add_credits(
        v_user,
        v_code.credits_per_student,
        'class_code',
        'class:' || v_code.code || ':' || v_user::text
    );

    return jsonb_build_object(
        'ok', true,
        'credits', v_code.credits_per_student,
        'balance', v_balance
    );
end;
$$;

revoke all on function public.redeem_class_code(text) from public, anon;
grant execute on function public.redeem_class_code(text) to authenticated;
