-- 2026-10-20
-- El front (src/store/userStore.ts) escribía completed_topics / completed_exercises
-- en public.profiles, pero esas columnas no existían -> PostgREST 42703 y el progreso
-- de los usuarios logueados nunca se guardaba (el error se tragaba en un try/catch).

alter table public.profiles
  add column if not exists completed_topics    text[]      not null default '{}',
  add column if not exists completed_exercises text[]      not null default '{}',
  add column if not exists created_at          timestamptz not null default now();
