-- Registro de pagos de Ko-fi: auditoría, idempotencia y avisos de pagos sin cuenta.
-- Solo lo usa la Edge Function kofi-webhook con service_role.
-- No tiene políticas RLS: ningún usuario puede leerlo desde el cliente.

create table if not exists public.kofi_events (
    id uuid primary key default gen_random_uuid(),
    message_id text unique,
    transaction_id text,
    event_type text,
    email text,
    amount text,
    currency text,
    tier_name text,
    matched_profile uuid references public.profiles(id) on delete set null,
    status text not null default 'received',
    months_added integer,
    payload jsonb,
    created_at timestamptz not null default now()
);

alter table public.kofi_events enable row level security;

create index if not exists kofi_events_email_idx on public.kofi_events (lower(email));
create index if not exists kofi_events_created_idx on public.kofi_events (created_at desc);

comment on table public.kofi_events is
    'Pagos recibidos por el webhook de Ko-fi. status: applied | unmatched | ignored | duplicate';
