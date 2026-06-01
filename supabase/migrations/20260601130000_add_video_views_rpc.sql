-- Create a function to safely increment video views (prevents race conditions)
create or replace function public.increment_video_views(video_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.videos
  set views = coalesce(views, 0) + 1
  where id = video_id;
end;
$$;

-- Grant execute to anon and authenticated so the public front-end can call it
grant execute on function public.increment_video_views(uuid) to anon;
grant execute on function public.increment_video_views(uuid) to authenticated;
