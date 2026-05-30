-- Add view_count column to articles table
alter table public.articles
  add column if not exists view_count integer not null default 0;

-- Create a function to safely increment view count (prevents race conditions)
create or replace function public.increment_view_count(article_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.articles
  set view_count = view_count + 1
  where id = article_id;
end;
$$;

-- Grant execute to anon so the public front-end can call it
grant execute on function public.increment_view_count(uuid) to anon;
grant execute on function public.increment_view_count(uuid) to authenticated;

-- Enable Row Level Security on articles (if not already)
alter table public.articles enable row level security;

-- Allow everyone to read articles
create policy "Public read articles"
  on public.articles for select
  using (true);

-- Only service role can insert/update/delete (used by edge function)
create policy "Service role write articles"
  on public.articles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
