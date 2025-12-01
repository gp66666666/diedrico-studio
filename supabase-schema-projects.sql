-- Projects table for cloud save/load (Premium feature)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  thumbnail_url text,
  data jsonb not null, -- Stores the entire geometry state
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Policy: Users can only see their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own projects
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own projects
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own projects
create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index projects_user_id_idx on public.projects(user_id);
create index projects_created_at_idx on public.projects(created_at desc);

-- Trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_project_updated
  before update on public.projects
  for each row
  execute procedure public.handle_updated_at();
