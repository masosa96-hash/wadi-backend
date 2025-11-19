-- Project Memory System
-- Stores summarized context and key learnings from project conversations

CREATE TABLE IF NOT EXISTS project_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Memory content
  summary TEXT NOT NULL,
  key_points TEXT[],
  topics TEXT[],
  
  -- Metadata
  run_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_memory_project ON project_memory(project_id);
CREATE INDEX idx_project_memory_user ON project_memory(user_id);

-- RLS Policies
ALTER TABLE project_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project memory"
  ON project_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project memory"
  ON project_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project memory"
  ON project_memory FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own project memory"
  ON project_memory FOR DELETE
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE project_memory IS 'Stores AI-generated summaries and context for projects';
COMMENT ON COLUMN project_memory.summary IS 'High-level summary of the project progress';
COMMENT ON COLUMN project_memory.key_points IS 'Array of important insights and learnings';
COMMENT ON COLUMN project_memory.topics IS 'Array of main topics discussed in the project';
