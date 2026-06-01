-- Drop the old service role only write policy
drop policy if exists "Service role write podcasts" on public.podcasts;

-- Create Super Admin write podcasts policy (allows super admins to insert, update, and delete podcasts)
create policy "Super Admin write podcasts" on public.podcasts for all
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
