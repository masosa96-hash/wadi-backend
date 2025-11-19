-- WADI Sessions Feature - Database Schema
-- This file contains the SQL schema for sessions and related updates

-- ============================================
-- 1. CREATE SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- 2. ADD session_id TO RUNS TABLE
-- ============================================

ALTER TABLE runs
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE SET NULL;

-- ============================================
-- 3. ADD custom_name TO RUNS TABLE (for renaming)
-- ============================================

ALTER TABLE runs
ADD COLUMN IF NOT EXISTS custom_name TEXT;

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_runs_session_id ON runs(session_id);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY ON SESSIONS
-- ============================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE FUNCTION TO UPDATE session updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_updated_at();

-- ============================================
-- 7. CREATE FUNCTION TO UPDATE run_count
-- ============================================

CREATE OR REPLACE FUNCTION update_session_run_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sessions
    SET run_count = run_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sessions
    SET run_count = run_count - 1,
        updated_at = NOW()
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER runs_session_count
  AFTER INSERT OR DELETE ON runs
  FOR EACH ROW
  WHEN (NEW.session_id IS NOT NULL OR OLD.session_id IS NOT NULL)
  EXECUTE FUNCTION update_session_run_count();

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE sessions IS 'Organizes runs into conversational sessions within projects';
COMMENT ON COLUMN sessions.name IS 'User-defined session name';
COMMENT ON COLUMN sessions.description IS 'Optional session description/purpose';
COMMENT ON COLUMN sessions.run_count IS 'Auto-calculated count of runs in this session';
COMMENT ON COLUMN sessions.is_active IS 'Indicates if this is the currently active session for the project';
COMMENT ON COLUMN runs.session_id IS 'Reference to the session this run belongs to';
COMMENT ON COLUMN runs.custom_name IS 'User-defined custom name for the run';
