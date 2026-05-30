-- Enable realtime publication for notifications table
begin;
  alter publication supabase_realtime add table public.notifications;
commit;
