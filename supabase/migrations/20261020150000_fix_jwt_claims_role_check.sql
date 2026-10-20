-- 2026-10-20
-- FIX del FIX: PostgREST 13 ya no expone `request.jwt.claim.role`; ahora los claims van
-- juntos en `request.jwt.claims` (JSON). Con la comprobación anterior el trigger no
-- bloqueaba nada y un usuario logueado podía hacer
--   PATCH /rest/v1/profiles?id=eq.<su-id>  { "is_premium": true, "role": "admin" }
--
-- Comprobado en vivo con dos usuarios de prueba:
--   request.jwt.claim.role -> null
--   request.jwt.claims     -> {"role":"authenticated", ...}   (service_role -> "service_role")
--   session_user           -> "authenticator" en ambos casos
--
-- Regla: si el claim dice service_role/postgres/supabase_admin -> permitir;
--        si no hay claim (psql directo) -> permitir; cualquier otro rol -> revertir.

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
    new.is_premium := old.is_premium;
    new.role       := old.role;
    new.email      := old.email;
  end if;

  return new;
end;
$$;
