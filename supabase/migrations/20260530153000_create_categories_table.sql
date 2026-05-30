-- 1. Create categories table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.categories enable row level security;

-- 3. Setup RLS Policies
create policy "Allow public read access to categories" on public.categories
  for select using (true);

create policy "Allow full access to categories" on public.categories
  for all using (true);

-- 4. Seed categories
insert into public.categories (name)
values 
  ('Politics'),
  ('Business'),
  ('Economy'),
  ('Security'),
  ('Multimedia'),
  ('Sports'),
  ('National'),
  ('World')
on conflict (name) do nothing;
