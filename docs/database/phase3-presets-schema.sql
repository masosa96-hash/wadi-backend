-- ============================================================================
-- PHASE 3: PROMPT PRESETS SCHEMA
-- ============================================================================
-- This script creates the database schema for prompt presets
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Create presets table
CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK(char_length(name) <= 200),
  description TEXT CHECK(char_length(description) <= 1000),
  content TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  folder TEXT CHECK(char_length(folder) <= 100),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_workspace_id ON presets(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_presets_project_id ON presets(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_presets_folder ON presets(folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON presets(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_presets_updated_at ON presets;
CREATE TRIGGER update_presets_updated_at
    BEFORE UPDATE ON presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for presets

-- Users can view their own presets or public presets
DROP POLICY IF EXISTS "Users can view their presets or public presets" ON presets;
CREATE POLICY "Users can view their presets or public presets" ON presets
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR is_public = true
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Users can create their own presets
DROP POLICY IF EXISTS "Users can create their own presets" ON presets;
CREATE POLICY "Users can create their own presets" ON presets
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    ) AND (
      project_id IS NULL OR
      project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own presets
DROP POLICY IF EXISTS "Users can update their own presets" ON presets;
CREATE POLICY "Users can update their own presets" ON presets
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own presets
DROP POLICY IF EXISTS "Users can delete their own presets" ON presets;
CREATE POLICY "Users can delete their own presets" ON presets
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to execute preset (creates a run)
CREATE OR REPLACE FUNCTION execute_preset(
  p_preset_id UUID,
  p_project_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_preset_content TEXT;
  v_preset_model TEXT;
  v_run_id UUID;
BEGIN
  -- Get preset content and model
  SELECT content, model INTO v_preset_content, v_preset_model
  FROM presets
  WHERE id = p_preset_id
  AND (user_id = p_user_id OR is_public = true);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preset not found or access denied';
  END IF;

  -- Note: This function just returns the preset info
  -- Actual run creation with AI should be done via the API
  -- which will handle credit consumption
  
  RETURN p_preset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE presets IS 'Prompt templates/presets for quick AI execution';
COMMENT ON COLUMN presets.content IS 'The actual prompt content/template';
COMMENT ON COLUMN presets.model IS 'Default AI model to use with this preset';
COMMENT ON COLUMN presets.folder IS 'Optional folder/category for organization';
COMMENT ON COLUMN presets.is_public IS 'Whether this preset is shared publicly';
COMMENT ON COLUMN presets.workspace_id IS 'Optional workspace association';
COMMENT ON COLUMN presets.project_id IS 'Optional project association';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Run these queries to verify the schema was created correctly:
-- SELECT * FROM presets LIMIT 1;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'presets';
