-- Láminas guardadas en la nube: un documento por usuario (jsonb pequeño).
-- Antes vivían solo en localStorage, así que se perdían al cambiar de equipo.
-- Sin Storage: es un único JSON por usuario, cabe de sobra en el plan gratuito.

create table if not exists public.laminas_docs (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.laminas_docs enable row level security;

drop policy if exists "laminas_docs_own" on public.laminas_docs;
create policy "laminas_docs_own"
    on public.laminas_docs
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists laminas_docs_updated_idx on public.laminas_docs (updated_at desc);

comment on table public.laminas_docs is
    'Documento de láminas de cada usuario. Se sincroniza desde la vista Láminas (autoguardado).';
