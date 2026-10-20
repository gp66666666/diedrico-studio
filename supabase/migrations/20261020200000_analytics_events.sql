-- Eventos de producto (embudo de conversión) sin depender de Vercel Pro.
--
-- Los eventos personalizados de Vercel Analytics son de pago (Pro). Aquí se
-- guardan en Supabase: la web solo puede INSERTAR, nunca leer, así que nadie
-- puede sacar datos de otros. No se guarda IP ni email, solo el nombre del
-- evento, propiedades opcionales y la ruta.

create table if not exists public.analytics_events (
    id bigserial primary key,
    name text not null check (char_length(name) between 1 and 64),
    props jsonb check (props is null or pg_column_size(props) < 2048),
    path text,
    user_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

-- Insertar: cualquiera (también invitados). Leer: nadie desde el cliente.
drop policy if exists "analytics_insert" on public.analytics_events;
create policy "analytics_insert"
    on public.analytics_events
    for insert
    to anon, authenticated
    with check (true);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events (name, created_at desc);

comment on table public.analytics_events is
    'Embudo de producto (premium_modal_open, ai_gate...). Solo INSERT desde la web; lectura con service_role.';
