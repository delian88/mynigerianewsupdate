-- Create profiles table referencing auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'user',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Setup RLS Policies for profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow individual profile owners to update their profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow super admin to do anything on profiles" on public.profiles
  for all using (
    (select role from public.profiles where id = auth.uid()) = 'super_admin'
  );

-- Function to handle automated new user registration trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role text := 'user';
begin
  -- Automatically designate specific admin emails as super_admin
  if new.email = 'admin@mynigeria.news' or new.email = 'superadmin@mynigeria.news' then
    default_role := 'super_admin';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, default_role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
