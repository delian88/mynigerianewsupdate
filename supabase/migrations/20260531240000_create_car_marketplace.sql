-- 1. Create Marketplace Cars Table
create table if not exists public.marketplace_cars (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  price text not null,
  price_val bigint not null,
  year integer not null,
  model text not null,
  location text not null,
  badge text not null,
  img text not null,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'approved',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Subscription Plans Table
create table if not exists public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  duration_days integer not null default 30,
  features text[] not null default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create User Subscriptions Table
create table if not exists public.user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete cascade,
  status text not null default 'active',
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.marketplace_cars enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

-- 5. Establish RLS Policies on marketplace_cars
create policy "Public read cars"
  on public.marketplace_cars for select
  using (true);

create policy "Authenticated insert cars"
  on public.marketplace_cars for insert
  with check (auth.role() = 'authenticated');

create policy "Owner or Admin update cars"
  on public.marketplace_cars for update
  using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Owner or Admin delete cars"
  on public.marketplace_cars for delete
  using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- 6. Establish RLS Policies on subscription_plans
create policy "Public read plans"
  on public.subscription_plans for select
  using (true);

create policy "Admin manage plans"
  on public.subscription_plans for all
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- 7. Establish RLS Policies on user_subscriptions
create policy "Owner or Admin read subscriptions"
  on public.user_subscriptions for select
  using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Owner insert subscriptions"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Admin manage subscriptions"
  on public.user_subscriptions for all
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- 8. Seed Default Cars
insert into public.marketplace_cars (title, price, price_val, year, model, location, badge, img)
values 
  ('2022 Toyota Prado (TX-L) - Full Option', '₦85,000,000', 85000000, 2022, 'Toyota', 'Lagos, NG', 'Verified Dealer', 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=700&auto=format&fit=crop&q=60'),
  ('Mercedes-Benz G63 AMG - Bulletproof', '₦180,000,000', 180000000, 2023, 'Mercedes', 'Abuja, NG', 'Secure Trade', 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=600&fit=crop'),
  ('Toyota Hilux Adventure 2021', '₦45,000,000', 45000000, 2021, 'Toyota', 'Ikeja, Lagos', 'Accessories', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&fit=crop'),
  ('2021 Lexus RX 350 - Silver', '₦45,500,000', 45500000, 2021, 'Lexus', 'Port Harcourt', 'Hot', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=400&fit=crop')
on conflict do nothing;

-- 9. Seed Default Subscription Plans
insert into public.subscription_plans (name, price, duration_days, features)
values
  ('Basic Weekly Ad', 5000, 7, array['7 Days Visibility', 'Standard Reach', '1 Image Upload']),
  ('Premium Dealer Monthly', 15000, 30, array['30 Days Visibility', 'Highlighted Badge', 'Up to 5 Images', 'Priority Placement']),
  ('Unlimited Enterprise Annual', 120000, 365, array['365 Days Visibility', 'Featured Homepage Banner', 'Infinite Images', 'Dedicated Dealer Page', 'Supervised Escrow Trade'])
on conflict do nothing;
