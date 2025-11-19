-- WADI Tagging System - Database Schema
-- This file contains the SQL schema for tags and tag associations

-- ============================================
-- 1. CREATE TAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. CREATE TAG ASSOCIATION TABLES
-- ============================================

-- Project Tags Association
CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- Run Tags Association
CREATE TABLE IF NOT EXISTS run_tags (
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (run_id, tag_id)
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_run_tags_run_id ON run_tags(run_id);
CREATE INDEX IF NOT EXISTS idx_run_tags_tag_id ON run_tags(tag_id);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY ON TAGS
-- ============================================

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_tags ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tags
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tags
CREATE POLICY "Users can create own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Project tags policies
CREATE POLICY "Users can view project tags"
  ON project_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add project tags"
  ON project_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove project tags"
  ON project_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Run tags policies
CREATE POLICY "Users can view run tags"
  ON run_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM runs
      WHERE runs.id = run_tags.run_id
      AND runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add run tags"
  ON run_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM runs
      WHERE runs.id = run_tags.run_id
      AND runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove run tags"
  ON run_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM runs
      WHERE runs.id = run_tags.run_id
      AND runs.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. UNIQUE CONSTRAINT FOR TAG NAMES PER USER
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS unique_tag_name_per_user 
  ON tags(user_id, LOWER(name));

-- ============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE tags IS 'User-defined tags for categorizing projects and runs';
COMMENT ON COLUMN tags.name IS 'Tag display name (case-insensitive unique per user)';
COMMENT ON COLUMN tags.color IS 'Hex color code for tag display';

COMMENT ON TABLE project_tags IS 'Many-to-many relationship between projects and tags';
COMMENT ON TABLE run_tags IS 'Many-to-many relationship between runs and tags';
