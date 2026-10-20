-- 2026-10-20
-- FIX: el trigger protect_profile_privileges no protegía nada.
-- Estaba declarado SECURITY DEFINER y comprobaba current_user, que dentro de una función
-- SECURITY DEFINER es el DUEÑO (postgres) y no el rol de la petición. Resultado: cualquier
-- usuario logueado podía hacer PATCH { is_premium: true, role: 'admin' } en su propio perfil.
--
-- Ahora se mira el claim del JWT (request.jwt.claim.role), que PostgREST fija por petición.
-- Si no hay claim (conexión directa con psql), se asume contexto de confianza.

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'direct');

  if v_role not in ('service_role', 'postgres', 'supabase_admin', 'direct') then
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
