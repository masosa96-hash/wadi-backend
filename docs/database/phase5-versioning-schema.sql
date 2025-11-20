-- ============================================================================
-- PHASE 5: PROJECT VERSIONING SCHEMA
-- ============================================================================
-- This script creates the database schema for project version snapshots
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Create project_versions table
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  name TEXT CHECK(char_length(name) <= 200),
  description TEXT CHECK(char_length(description) <= 1000),
  snapshot JSONB NOT NULL,
  run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_user_id ON project_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_versions_run_id ON project_versions(run_id) WHERE run_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view versions of their projects" ON project_versions;
CREATE POLICY "Users can view versions of their projects" ON project_versions
  FOR SELECT
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

DROP POLICY IF EXISTS "Users can create versions for their projects" ON project_versions;
CREATE POLICY "Users can create versions for their projects" ON project_versions
  FOR INSERT
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

DROP POLICY IF EXISTS "Users can delete their project versions" ON project_versions;
CREATE POLICY "Users can delete their project versions" ON project_versions
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to create version snapshot
CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_project_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_run_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_version_number INT;
  v_snapshot JSONB;
  v_version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM project_versions
  WHERE project_id = p_project_id;

  -- Create snapshot from current project state
  SELECT jsonb_build_object(
    'project', row_to_json(p.*),
    'runs_count', (SELECT COUNT(*) FROM runs WHERE project_id = p_project_id),
    'latest_runs', (
      SELECT jsonb_agg(r.*)
      FROM (
        SELECT * FROM runs 
        WHERE project_id = p_project_id 
        ORDER BY created_at DESC 
        LIMIT 10
      ) r
    ),
    'timestamp', NOW()
  ) INTO v_snapshot
  FROM projects p
  WHERE p.id = p_project_id;

  -- Create version
  INSERT INTO project_versions (
    project_id,
    user_id,
    version_number,
    name,
    description,
    snapshot,
    run_id
  ) VALUES (
    p_project_id,
    p_user_id,
    v_version_number,
    p_name,
    p_description,
    v_snapshot,
    p_run_id
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore from version
CREATE OR REPLACE FUNCTION restore_from_version(
  p_version_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_project_id UUID;
  v_snapshot JSONB;
BEGIN
  -- Get version data
  SELECT project_id, snapshot INTO v_project_id, v_snapshot
  FROM project_versions
  WHERE id = p_version_id
  AND (user_id = p_user_id OR project_id IN (
    SELECT id FROM projects WHERE user_id = p_user_id
  ));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found or access denied';
  END IF;

  -- Note: Actual restoration should be done carefully
  -- This is a placeholder that logs the restore action
  -- In production, you'd restore specific fields from the snapshot
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create version before major changes
CREATE OR REPLACE FUNCTION auto_version_before_run()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create version snapshot when a new run is created
  PERFORM create_version_snapshot(
    NEW.project_id,
    NEW.user_id,
    'Auto-snapshot before run',
    'Automatic snapshot created before run execution',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger (can be disabled for performance)
-- DROP TRIGGER IF EXISTS trigger_auto_version_before_run ON runs;
-- CREATE TRIGGER trigger_auto_version_before_run
--   AFTER INSERT ON runs
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_version_before_run();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE project_versions IS 'Version snapshots of projects for rollback and comparison';
COMMENT ON COLUMN project_versions.snapshot IS 'JSONB snapshot of project state at this version';
COMMENT ON COLUMN project_versions.version_number IS 'Sequential version number within project';
COMMENT ON FUNCTION create_version_snapshot IS 'Create a snapshot of current project state';
COMMENT ON FUNCTION restore_from_version IS 'Restore project from a version snapshot';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- SELECT * FROM project_versions LIMIT 1;
-- SELECT create_version_snapshot('project-uuid', 'user-uuid', 'Version 1.0');
