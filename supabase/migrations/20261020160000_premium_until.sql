-- 2026-10-20
-- Membresías de Ko-fi: el premium puede caducar.
-- `is_premium` sigue mandando (permite cortar el acceso a mano), pero si hay fecha y ya
-- pasó, la app lo trata como no premium. Así una suscripción mensual no queda activa para
-- siempre si se olvida renovarla.

alter table public.profiles
  add column if not exists premium_until timestamptz;

comment on column public.profiles.premium_until is
  'Fin del premium. NULL = sin caducidad (mientras is_premium sea true).';

-- El cliente tampoco debe poder tocarla: se revierte igual que is_premium.
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
  end if;

  return new;
end;
$$;
