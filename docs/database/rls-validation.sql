-- ============================================================================
-- RLS VALIDATION AND VERIFICATION SCRIPT
-- ============================================================================
-- This script validates Row Level Security (RLS) policies are working correctly
-- Run this in Supabase SQL Editor to test RLS policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: VERIFY RLS IS ENABLED
-- ============================================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('workspaces', 'workspace_members', 'projects', 'runs', 'memories', 'tasks');

-- Expected: All tables should have rowsecurity = true

-- ============================================================================
-- SECTION 2: LIST ALL RLS POLICIES
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 3: WORKSPACE POLICIES VALIDATION
-- ============================================================================

-- Policy: Users can view workspaces they are members of
-- Expected behavior: Users can only SELECT workspaces where they are in workspace_members

-- Policy: Users can create their own workspaces
-- Expected behavior: Users can INSERT workspaces where they are the owner_id

-- Policy: Workspace owners and admins can update workspaces
-- Expected behavior: Only owners and admins can UPDATE workspaces

-- Policy: Workspace owners can delete workspaces
-- Expected behavior: Only owners can DELETE workspaces

-- ============================================================================
-- SECTION 4: WORKSPACE MEMBERS POLICIES VALIDATION
-- ============================================================================

-- Policy: Users can view workspace members if they are members
-- Expected behavior: Users can SELECT workspace_members for workspaces they belong to

-- Policy: Workspace owners and admins can add members
-- Expected behavior: Only owners and admins can INSERT new members

-- Policy: Workspace owners and admins can update members
-- Expected behavior: Only owners and admins can UPDATE member roles

-- Policy: Workspace owners and admins can remove members
-- Expected behavior: Only owners and admins can DELETE members

-- ============================================================================
-- SECTION 5: PROJECTS RLS POLICIES (Need Update for Workspaces)
-- ============================================================================

-- Current: Projects use user_id for RLS
-- Required: Update to support workspace-based access

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Users can read own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- New workspace-aware policies for projects
CREATE POLICY "Users can view their projects or workspace projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = user_id 
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their workspaces"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      workspace_id IS NULL OR
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their projects or workspace projects"
  ON projects FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete their projects or workspace admins can delete"
  ON projects FOR DELETE
  USING (
    auth.uid() = user_id 
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- SECTION 6: RUNS RLS POLICIES (Update for Workspaces)
-- ============================================================================

-- Update runs policies to work with workspace-based projects
DROP POLICY IF EXISTS "Users can read own runs" ON runs;
DROP POLICY IF EXISTS "Users can insert own runs" ON runs;
DROP POLICY IF EXISTS "Users can update own runs" ON runs;
DROP POLICY IF EXISTS "Users can delete own runs" ON runs;

CREATE POLICY "Users can view runs for their projects or workspace projects"
  ON runs FOR SELECT
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() 
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can create runs for their projects or workspace projects"
  ON runs FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() 
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can update their runs"
  ON runs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their runs"
  ON runs FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 7: MEMORIES RLS POLICIES (Update for Workspaces)
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own memories" ON memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

CREATE POLICY "Users can view memories for accessible projects"
  ON memories FOR SELECT
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() 
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can create memories for accessible projects"
  ON memories FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() 
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can delete their memories"
  ON memories FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 8: TASKS RLS POLICIES (Update for Workspaces)
-- ============================================================================

-- Tasks policies should already support workspace through projects
-- Verify they are correctly configured

-- ============================================================================
-- SECTION 9: TEST QUERIES (Run as specific users)
-- ============================================================================

-- Test 1: User can only see their workspaces
-- SET LOCAL auth.uid = 'user-uuid-here';
-- SELECT * FROM workspaces;
-- Expected: Only workspaces where user is a member

-- Test 2: User can see workspace members
-- SET LOCAL auth.uid = 'user-uuid-here';
-- SELECT * FROM workspace_members WHERE workspace_id = 'workspace-uuid';
-- Expected: All members if user is a member of that workspace

-- Test 3: User can see projects in their workspaces
-- SET LOCAL auth.uid = 'user-uuid-here';
-- SELECT * FROM projects;
-- Expected: User's projects + workspace projects

-- Test 4: Non-admin cannot delete workspace
-- SET LOCAL auth.uid = 'member-user-uuid';
-- DELETE FROM workspaces WHERE id = 'workspace-uuid';
-- Expected: Error (insufficient privileges)

-- ============================================================================
-- SECTION 10: VERIFICATION CHECKLIST
-- ============================================================================

-- [ ] RLS enabled on all tables
-- [ ] Workspace policies: SELECT, INSERT, UPDATE, DELETE
-- [ ] Workspace members policies: SELECT, INSERT, UPDATE, DELETE
-- [ ] Projects policies updated for workspace access
-- [ ] Runs policies updated for workspace access
-- [ ] Memories policies updated for workspace access
-- [ ] Tasks policies support workspace access
-- [ ] Test queries confirm expected behavior
-- [ ] No unauthorized access possible

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces - RLS enforced';
COMMENT ON TABLE workspace_members IS 'Workspace membership with role-based access - RLS enforced';
COMMENT ON TABLE projects IS 'Projects can belong to workspaces - RLS enforced for workspace access';
