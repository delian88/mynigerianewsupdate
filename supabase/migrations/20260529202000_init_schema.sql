-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Site Settings Table
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  logo_url text,
  about_us_text text,
  contact_email text,
  contact_phone text,
  contact_address text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert a default row so we always have one settings record
insert into public.site_settings (about_us_text, contact_email) 
values ('Welcome to MyNigeria News.', 'info@mynigeria.news')
on conflict do nothing;

-- 2. Articles Table
create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null unique,
  content text,
  cover_image_url text,
  category text,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Podcasts Table
create table if not exists public.podcasts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  audio_url text,
  thumbnail_url text,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Storage Bucket for Media
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage Policies for Media bucket (Public read, authenticated insert/update/delete)
create policy "Public Access" on storage.objects for select using ( bucket_id = 'media' );
create policy "Authenticated Insert" on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Authenticated Update" on storage.objects for update using ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Authenticated Delete" on storage.objects for delete using ( bucket_id = 'media' and auth.role() = 'authenticated' );
-- 5. Set up pg_cron to fetch news daily
create extension if not exists "pg_net";
create extension if not exists "pg_cron";

select cron.schedule(
    'fetch-daily-news',
    '0 0 * * *', -- Run every day at midnight
    $$
        select net.http_post(
                url := 'https://dsqwhzcaiyvcliigmggd.supabase.co/functions/v1/fetch-news',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcXdoemNhaXl2Y2xpaWdtZ2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc5NDcsImV4cCI6MjA5NTY1Mzk0N30.hhMMaipNx-MDqFaAdoJIv4JKOIge0GGJOMgYEYBQMjA"}'::jsonb,
                body := '{}'::jsonb
        ) as request_id;
    $$
);