-- ============================================================================
-- PHASE 6: LOCAL FILE HANDLING SCHEMA
-- ============================================================================
-- This script creates the database schema for file uploads and attachments
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL CHECK(char_length(filename) <= 500),
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  parsed_content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create run_files junction table
CREATE TABLE IF NOT EXISTS run_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(run_id, file_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_user_id ON project_files(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_file_type ON project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_run_files_run_id ON run_files(run_id);
CREATE INDEX IF NOT EXISTS idx_run_files_file_id ON run_files(file_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;
CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_files
DROP POLICY IF EXISTS "Users can view files in their projects" ON project_files;
CREATE POLICY "Users can view files in their projects" ON project_files
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

DROP POLICY IF EXISTS "Users can upload files to their projects" ON project_files;
CREATE POLICY "Users can upload files to their projects" ON project_files
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

DROP POLICY IF EXISTS "Users can delete their files" ON project_files;
CREATE POLICY "Users can delete their files" ON project_files
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for run_files
DROP POLICY IF EXISTS "Users can view run files" ON run_files;
CREATE POLICY "Users can view run files" ON run_files
  FOR SELECT
  USING (
    run_id IN (SELECT id FROM runs WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can attach files to their runs" ON run_files;
CREATE POLICY "Users can attach files to their runs" ON run_files
  FOR INSERT
  WITH CHECK (
    run_id IN (SELECT id FROM runs WHERE user_id = auth.uid())
  );

-- Function to get file statistics
CREATE OR REPLACE FUNCTION get_project_file_stats(p_project_id UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  file_types JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size,
    jsonb_object_agg(file_type, count) as file_types
  FROM (
    SELECT 
      file_type,
      COUNT(*)::INT as count
    FROM project_files
    WHERE project_id = p_project_id
    GROUP BY file_type
  ) subq;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE BUCKET (Supabase Storage)
-- ============================================================================

-- Note: Create storage bucket via Supabase Dashboard or SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies would be:
-- CREATE POLICY "Users can upload to their projects"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'project-files' AND auth.uid() = owner);

-- CREATE POLICY "Users can view their project files"  
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'project-files' AND auth.uid() = owner);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE project_files IS 'File uploads and attachments for projects';
COMMENT ON TABLE run_files IS 'Junction table linking runs to files';
COMMENT ON COLUMN project_files.parsed_content IS 'Parsed/extracted text content from file';
COMMENT ON COLUMN project_files.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON FUNCTION get_project_file_stats IS 'Get file statistics for a project';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- SELECT * FROM project_files LIMIT 1;
-- SELECT * FROM get_project_file_stats('project-uuid');
