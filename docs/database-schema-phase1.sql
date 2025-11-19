-- WADI Vector Memory and Tasks System Schema
-- To be executed in Supabase SQL Editor

-- =====================================================
-- 1. Enable pgvector extension for vector operations
-- =====================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. Memories Table (Vector Store)
-- =====================================================
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding TEXT NOT NULL, -- Store as JSON for now, migrate to vector type later
  metadata JSONB DEFAULT '{}',
  run_id UUID REFERENCES runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for memories
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_run_id ON memories(run_id) WHERE run_id IS NOT NULL;

-- Row Level Security for memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Users can read their own memories
CREATE POLICY "Users can read own memories"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert own memories"
  ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own memories
CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. Tasks Table (Project Task Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 500),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Row Level Security for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can read tasks from their own projects
CREATE POLICY "Users can read project tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert tasks for their own projects
CREATE POLICY "Users can insert project tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update their own tasks or tasks in their projects
CREATE POLICY "Users can update project tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete their own tasks or tasks in their projects
CREATE POLICY "Users can delete project tasks"
  ON tasks FOR DELETE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. Trigger to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Trigger to set completed_at when status changes to completed
-- =====================================================
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_status_completed_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_completed_at();

-- =====================================================
-- 6. Comments
-- =====================================================
COMMENT ON TABLE memories IS 'Vector memory store for long-term AI context and semantic search';
COMMENT ON COLUMN memories.embedding IS 'Vector embedding for semantic search (stored as JSON, migrate to vector type when pgvector is ready)';
COMMENT ON COLUMN memories.metadata IS 'Additional metadata like source, tags, timestamps';

COMMENT ON TABLE tasks IS 'Project task management with AI auto-generation support';
COMMENT ON COLUMN tasks.ai_generated IS 'Whether this task was generated by AI';
COMMENT ON COLUMN tasks.metadata IS 'Additional task metadata like tags, subtasks, dependencies';
