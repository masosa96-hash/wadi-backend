-- Share Links System
-- Enables public sharing of individual runs or entire sessions

-- Share Links Table
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What is being shared
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Share configuration
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  password_hash TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  
  -- At least one of run_id or session_id must be set
  CONSTRAINT share_target_check CHECK (
    (run_id IS NOT NULL AND session_id IS NULL) OR
    (run_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_user ON share_links(user_id);
CREATE INDEX idx_share_links_run ON share_links(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX idx_share_links_session ON share_links(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_share_links_expires ON share_links(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Users can view their own share links
CREATE POLICY "Users can view own share links"
  ON share_links FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create share links for their own content
CREATE POLICY "Users can create share links for own content"
  ON share_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own share links
CREATE POLICY "Users can update own share links"
  ON share_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own share links
CREATE POLICY "Users can delete own share links"
  ON share_links FOR DELETE
  USING (auth.uid() = user_id);

-- Function to generate random token
CREATE OR REPLACE FUNCTION generate_share_token() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired share links (can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_share_links() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM share_links
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE share_links IS 'Stores public share links for runs and sessions';
COMMENT ON COLUMN share_links.token IS 'Unique URL-safe token for accessing the share';
COMMENT ON COLUMN share_links.expires_at IS 'When the share link expires (NULL for never)';
COMMENT ON COLUMN share_links.password_hash IS 'Optional bcrypt password hash for protected shares';
COMMENT ON COLUMN share_links.max_views IS 'Maximum number of views allowed (NULL for unlimited)';
