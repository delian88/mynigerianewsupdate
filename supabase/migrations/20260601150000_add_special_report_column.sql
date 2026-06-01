-- Add is_special_report column to articles table to support admin-managed premium investigative reports
alter table public.articles
  add column if not exists is_special_report boolean not null default false;
