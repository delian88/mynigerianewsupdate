-- Add excerpt and source_url columns to articles table
alter table public.articles
  add column if not exists excerpt text,
  add column if not exists source_url text;
