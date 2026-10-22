-- 2026-10-22
-- Devolver una consulta al contador de prueba si la llamada al proveedor falla.
--
-- Sin esto, un 429 o una caída de Groq/DeepSeek gastaría uno de los 3 mensajes
-- gratis sin haber dado respuesta. El proxy lo llama solo cuando ya había
-- consumido la prueba.

create or replace function public.release_ai_quota(p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_rate_limits
     set count = greatest(count - 1, 0)
   where key = p_key;
$$;

revoke all on function public.release_ai_quota(text) from public, anon, authenticated;
grant execute on function public.release_ai_quota(text) to service_role;
