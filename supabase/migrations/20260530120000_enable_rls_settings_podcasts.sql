-- Enable Row Level Security on site_settings and podcasts tables
alter table public.site_settings enable row level security;
alter table public.podcasts enable row level security;

-- 1. Site Settings Policies
create policy "Public read site_settings"
  on public.site_settings for select
  using (true);

create policy "Service role write site_settings"
  on public.site_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 2. Podcasts Policies
create policy "Public read podcasts"
  on public.podcasts for select
  using (true);

create policy "Service role write podcasts"
  on public.podcasts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
