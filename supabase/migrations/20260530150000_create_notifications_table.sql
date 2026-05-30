-- 1. Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  type text not null default 'info', -- 'info', 'success', 'warning', 'user', 'article'
  read boolean not null default false,
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.notifications enable row level security;

-- 3. Setup RLS Policies
create policy "Allow public read access to notifications" on public.notifications
  for select using (true);

create policy "Allow full access to notifications" on public.notifications
  for all using (true);

-- 4. Insert seed notifications
insert into public.notifications (title, message, type, read, created_at)
values 
  ('New article published', 'Senate finalizes new minimum wage structure for civil servants', 'article', false, now() - interval '2 minutes'),
  ('New user registered', 'john.doe@example.com signed up', 'user', false, now() - interval '15 minutes'),
  ('Comment reported', 'On: Energy Report: Nigeria''s domestic capacity projects', 'warning', false, now() - interval '32 minutes'),
  ('System backup completed', 'Daily database backup successfully stored in AWS S3', 'success', false, now() - interval '2 hours'),
  ('Breaking news ticker updated', 'Dynamic ticker refreshed with latest 5 articles', 'info', true, now() - interval '3 hours');
