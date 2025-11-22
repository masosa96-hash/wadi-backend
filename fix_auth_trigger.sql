-- Run this script in Supabase SQL Editor to fix the registration error
-- It ONLY updates the function, so it won't fail if tables already exist.

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
    raise exception 'Error initializing user account: %', SQLERRM;
end;
$$ language plpgsql security definer;

-- Ensure trigger is active
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
