-- 1. Create a security definer helper function to bypass RLS recursion
create or replace function public.check_is_super_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'super_admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the recursive policy
drop policy if exists "Allow super admin to do anything on profiles" on public.profiles;

-- 3. Create the new non-recursive policy using the helper function
create policy "Allow super admin to do anything on profiles" on public.profiles
  for all using (
    public.check_is_super_admin(auth.uid())
  );
