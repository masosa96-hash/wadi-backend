-- WADI Production Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  plan_id text default 'free',
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WORKSPACES
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references public.profiles(id) not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. WORKSPACE MEMBERS
create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'member', 'viewer')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

-- 4. FOLDERS
create table public.folders (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  parent_id uuid references public.folders(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PROJECTS (Updated)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  folder_id uuid references public.folders(id) on delete set null,
  status text default 'active',
  priority text default 'medium',
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TAGS
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text default '#64748B',
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. PROJECT TAGS (Junction)
create table public.project_tags (
  project_id uuid references public.projects(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (project_id, tag_id)
);

-- 8. AI PRESETS
create table public.ai_presets (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  prompt_template text not null,
  icon text,
  category text not null,
  workspace_id uuid references public.workspaces(id) on delete cascade, -- Null for system presets
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. USER USAGE
create table public.user_usage (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  plan_id text default 'free',
  messages_used int default 0,
  daily_messages_used int default 0,
  storage_used_mb float default 0,
  current_period_start timestamp with time zone default timezone('utc'::text, now()),
  current_period_end timestamp with time zone default timezone('utc'::text, now() + interval '1 month'),
  last_reset_date timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Basic Security)
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;

-- Profiles: Users can read/update their own profile
create policy "Users can see own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Workspaces: Members can view
create policy "Members can view workspace" on public.workspaces for select using (
  exists (select 1 from public.workspace_members where workspace_id = id and user_id = auth.uid())
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
begin
  -- 1. Create Profile (Safe insert)
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  
  -- 2. Create Default Workspace (Capture ID)
  insert into public.workspaces (name, slug, owner_id)
  values (
    'Mi Espacio', 
    'ws-' || substr(new.id::text, 1, 8), 
    new.id
  )
  returning id into new_workspace_id;
  
  -- 3. Add Member
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');
  
  -- 4. Init Usage
  insert into public.user_usage (user_id) values (new.id);
  
  return new;
exception
  when others then
    -- Log the error details for debugging
    raise log 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise to fail the transaction (so user knows signup failed)
    return null; -- Returning null cancels the auth.users insert? No, for AFTER trigger it doesn't.
    -- To block signup, we must raise exception.
    raise exception 'Error initializing user account: %', SQLERRM;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
