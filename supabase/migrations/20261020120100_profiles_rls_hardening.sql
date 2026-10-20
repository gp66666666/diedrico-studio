-- 2026-10-20
-- HALLAZGO: public.profiles tenía RLS DESACTIVADO y grants completos para anon.
-- Cualquiera con la anon key (pública, va en el bundle) podía:
--   - leer TODOS los perfiles (email, nombre, is_premium...)
--   - modificarlos (auto-asignarse is_premium = true)
--
-- Este script:
--   1. activa RLS en profiles con políticas "solo mi fila"
--   2. revoca privilegios peligrosos a anon/authenticated
--   3. blinda is_premium / role / email con un trigger (solo service_role los cambia)

alter table public.profiles enable row level security;

drop policy if exists "perfil propio: leer"   on public.profiles;
drop policy if exists "perfil propio: crear"  on public.profiles;
drop policy if exists "perfil propio: editar" on public.profiles;

create policy "perfil propio: leer"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "perfil propio: crear"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "perfil propio: editar"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Defensa en profundidad: el cliente no necesita estos privilegios.
revoke truncate, references, trigger on public.profiles from anon, authenticated;
revoke delete on public.profiles from anon, authenticated;

-- Columnas sensibles: si la petición no viene de service_role, se conserva el valor.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    new.is_premium := old.is_premium;
    new.role       := old.role;
    new.email      := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();
