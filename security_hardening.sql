-- SECURITY HARDENING & RLS POLICIES
-- Run this in Supabase SQL Editor to secure your data

-- 1. Enable RLS on all remaining tables
alter table public.folders enable row level security;
alter table public.tags enable row level security;
alter table public.project_tags enable row level security;
alter table public.ai_presets enable row level security;
alter table public.user_usage enable row level security;

-- 2. WORKSPACE MEMBERS POLICIES
-- Members can view other members in the same workspace
create policy "Members can view other members" on public.workspace_members
  for select using (
    exists (
      select 1 from public.workspace_members as wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
    )
  );

-- Only Owners/Admins can add/remove members (Simplified for MVP: Owners only)
create policy "Owners can manage members" on public.workspace_members
  for all using (
    exists (
      select 1 from public.workspace_members as wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
    )
  );

-- 3. PROJECTS POLICIES
-- Users can view projects if they are members of the workspace
create policy "Members can view projects" on public.projects
  for select using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = projects.workspace_id
      and user_id = auth.uid()
    )
  );

-- Users can create/update projects if they are members
create policy "Members can manage projects" on public.projects
  for all using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = projects.workspace_id
      and user_id = auth.uid()
    )
  );

-- 4. FOLDERS POLICIES
create policy "Members can view folders" on public.folders
  for select using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = folders.workspace_id
      and user_id = auth.uid()
    )
  );

create policy "Members can manage folders" on public.folders
  for all using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = folders.workspace_id
      and user_id = auth.uid()
    )
  );

-- 5. USER USAGE POLICIES
-- Users can only see their own usage
create policy "Users see own usage" on public.user_usage
  for select using (user_id = auth.uid());

-- System updates usage (usually via service role, but allow self-read)

-- 6. AI PRESETS POLICIES
-- Users can see system presets (workspace_id is null) OR workspace presets
create policy "View available presets" on public.ai_presets
  for select using (
    workspace_id is null 
    or exists (
      select 1 from public.workspace_members
      where workspace_id = ai_presets.workspace_id
      and user_id = auth.uid()
    )
  );
