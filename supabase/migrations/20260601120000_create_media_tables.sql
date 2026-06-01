-- 1. Create Videos Table
create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  video_url text not null,
  cover_image_url text not null,
  duration text default '0:00',
  views integer default 0,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Infographics Table
create table if not exists public.infographics (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text not null,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Photo Stories Table
create table if not exists public.photo_stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  cover_image_url text not null,
  images jsonb default '[]'::jsonb, -- array of photo URLs
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.videos enable row level security;
alter table public.infographics enable row level security;
alter table public.photo_stories enable row level security;

-- 5. RLS Policies

-- Public SELECT policies (allow anyone to read)
create policy "Public read videos" on public.videos for select using (true);
create policy "Public read infographics" on public.infographics for select using (true);
create policy "Public read photo_stories" on public.photo_stories for select using (true);

-- Super Admin Write policies (allow Super Admins to insert, update, delete)
create policy "Super Admin write videos" on public.videos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Super Admin write infographics" on public.infographics for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Super Admin write photo_stories" on public.photo_stories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );
