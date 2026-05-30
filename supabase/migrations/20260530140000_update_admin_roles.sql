-- Ensure existing admin users have the super_admin role in the profiles table
insert into public.profiles (id, email, role)
select id, email, 'super_admin'
from auth.users
where email in ('admin@mynigeria.news', 'superadmin@mynigeria.news')
on conflict (id) do update
set role = 'super_admin', email = excluded.email;
