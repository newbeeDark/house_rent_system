-- Revised Database Schema for Supabase
-- Based on User Request and Frontend Requirements

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (User management)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'landlord', 'agent', 'tenant', 'student', 'guest')), -- Added student/guest to match frontend types
  full_name text not null,
  avatar_url text,
  phone text,
  
  -- Tenant/Student specific
  student_id text,
  
  -- Agent specific
  agency_name text,
  agency_license text,
  
  -- Verification
  is_verified boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 3. Properties Table
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  
  -- Basic Info
  title text not null,
  description text, -- Mapped from 'desc'
  price numeric not null check (price >= 0),
  deposit numeric check (deposit >= 0), -- Added to match frontend 'deposit'
  address text not null,
  area text, -- Added to match frontend 'area'
  
  -- Categorization
  category text check (category in ('Studio', 'Apartment', 'Condo', 'Terrace', 'Bungalow', 'Room')), -- Mapped from 'propertyType'
  
  -- Specs
  beds integer not null check (beds > 0),
  bathrooms integer check (bathrooms >= 0), -- Mapped from 'bathroom'
  size_sqm numeric check (size_sqm > 0), -- Mapped from 'propertySize'
  kitchen boolean default false,
  furnished text check (furnished in ('full', 'half', 'none')),
  
  -- Location
  latitude numeric, -- Mapped from 'lat'
  longitude numeric, -- Mapped from 'lon'
  
  -- Features/Rules
  amenities text[], -- Mixed 'amenities' and 'features' from frontend
  rules text[], -- Added to match frontend 'rules'
  
  -- Availability
  available_from date,
  
  -- Metadata
  rating numeric default 0, -- Added to match frontend usage
  views_count integer default 0, -- For stats
  applications_count integer default 0, -- For stats
  
  status text default 'active' check (status in ('active', 'rented', 'delisted')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Properties
alter table public.properties enable row level security;
create policy "Active properties are publicly viewable" on public.properties for select using (status = 'active' OR auth.uid() = owner_id);
create policy "Verified landlords/agents can create properties" on public.properties for insert with check (
  auth.uid() = owner_id AND exists (select 1 from public.profiles where id = auth.uid() and role in ('landlord', 'agent'))
);
create policy "Owners can update own properties" on public.properties for update using (auth.uid() = owner_id);
create policy "Owners can delete own properties" on public.properties for delete using (auth.uid() = owner_id);

-- 4. Property Images (Handling 'img' and 'images' array)
create table public.property_images (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  is_cover boolean default false, -- True if this is the main 'img'
  order_index integer default 0,
  created_at timestamptz default now()
);

-- RLS for Images
alter table public.property_images enable row level security;
create policy "Property images are publicly viewable" on public.property_images for select using (true);
create policy "Owners can manage images" on public.property_images for all using (
  exists (select 1 from public.properties where id = property_id and owner_id = auth.uid())
);

-- 5. Applications (Matches 'Application' interface mostly)
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  property_owner_id uuid not null references public.profiles(id), -- Denormalized for RLS efficiency
  
  message text,
  documents jsonb, -- Stores file URLs and metadata
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(property_id, applicant_id)
);

-- Auto-fill property_owner_id trigger
create or replace function set_application_owner() returns trigger as $$
begin
  select owner_id into new.property_owner_id from public.properties where id = new.property_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_set_application_owner before insert on public.applications
for each row execute function set_application_owner();

-- RLS for Applications
alter table public.applications enable row level security;
create policy "Applicants can view own applications" on public.applications for select using (auth.uid() = applicant_id);
create policy "Owners can view received applications" on public.applications for select using (auth.uid() = property_owner_id);
create policy "Tenants can submit applications" on public.applications for insert with check (auth.uid() = applicant_id);
create policy "Owners can update application status" on public.applications for update using (auth.uid() = property_owner_id);

-- 6. Favorites
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, property_id)
);

alter table public.favorites enable row level security;
create policy "Users can manage favorites" on public.favorites for all using (auth.uid() = user_id);

-- 7. Complaints (Optional but good to have)
create table public.complaints (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text check (target_type in ('property', 'user')),
  target_id uuid not null,
  category text not null,
  description text not null,
  status text default 'open',
  created_at timestamptz default now()
);

alter table public.complaints enable row level security;
create policy "Admins see complaints" on public.complaints for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Users report complaints" on public.complaints for insert with check (auth.uid() = reporter_id);
