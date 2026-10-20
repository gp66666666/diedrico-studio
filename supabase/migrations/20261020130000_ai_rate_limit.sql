-- 2026-10-20
-- Rate limit del proxy de IA (Edge Function ai-proxy).
-- La función llama a check_ai_rate_limit con la service_role; el contador se guarda
-- por hash de IP + ventana temporal, así no se almacenan IPs en claro.

create table if not exists public.ai_rate_limits (
  key          text primary key,          -- sha256(ip)
  count        integer     not null default 0,
  window_start timestamptz not null default now()
);

alter table public.ai_rate_limits enable row level security;
revoke all on public.ai_rate_limits from anon, authenticated;

create or replace function public.check_ai_rate_limit(
  p_key text,
  p_limit integer default 60,
  p_window_seconds integer default 3600
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.ai_rate_limits as t (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
                  when t.window_start < now() - make_interval(secs => p_window_seconds) then 1
                  else t.count + 1
                end,
        window_start = case
                  when t.window_start < now() - make_interval(secs => p_window_seconds) then now()
                  else t.window_start
                end
  returning t.count into v_count;

  -- limpieza barata de ventanas viejas
  delete from public.ai_rate_limits
   where window_start < now() - interval '2 days';

  return v_count;
end;
$$;

-- Solo el servidor (service_role) puede ejecutarla; si no, cualquiera podría
-- inflar contadores de otras IPs desde PostgREST.
revoke execute on function public.check_ai_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to service_role;
