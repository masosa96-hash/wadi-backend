-- Migration: Workspace Enhancements for Dynamic Workspaces (P5)
-- Description: Add fields and tables to support automatic workspace creation and conversation organization

-- ============================================
-- 1. Enhance workspaces table
-- ============================================

ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS is_auto_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS detected_topic TEXT,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add index for filtering active/archived workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_archived ON workspaces(is_archived);
CREATE INDEX IF NOT EXISTS idx_workspaces_last_message ON workspaces(last_message_at DESC);

-- Add comment
COMMENT ON COLUMN workspaces.is_auto_created IS 'True if workspace was created automatically by topic detection';
COMMENT ON COLUMN workspaces.detected_topic IS 'AI-detected topic that triggered auto-creation';
COMMENT ON COLUMN workspaces.message_count IS 'Cached count of messages in this workspace';
COMMENT ON COLUMN workspaces.last_message_at IS 'Timestamp of last message in workspace for sorting';

-- ============================================
-- 2. Create workspace_conversations junction table
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Metadata
  moved_at TIMESTAMPTZ,
  moved_by UUID REFERENCES profiles(user_id),
  previous_workspace_id UUID REFERENCES workspaces(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure a conversation can only be in one workspace
  UNIQUE(conversation_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_conversations_workspace ON workspace_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_conversations_conversation ON workspace_conversations(conversation_id);

COMMENT ON TABLE workspace_conversations IS 'Maps conversations to workspaces, supports moving conversations between spaces';

-- ============================================
-- 3. Update conversations table
-- ============================================

-- Add workspace_id for easier querying (denormalized for performance)
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON conversations(workspace_id);

-- ============================================
-- 4. Create function to update workspace stats
-- ============================================

CREATE OR REPLACE FUNCTION update_workspace_stats(p_workspace_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE workspaces SET
    message_count = (
      SELECT COUNT(m.id)
      FROM workspace_conversations wc
      JOIN conversations c ON c.id = wc.conversation_id
      JOIN messages m ON m.conversation_id = c.id
      WHERE wc.workspace_id = p_workspace_id
    ),
    last_message_at = (
      SELECT MAX(m.created_at)
      FROM workspace_conversations wc
      JOIN conversations c ON c.id = wc.conversation_id
      JOIN messages m ON m.conversation_id = c.id
      WHERE wc.workspace_id = p_workspace_id
    ),
    updated_at = now()
  WHERE id = p_workspace_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create function to move conversation to workspace
-- ============================================

CREATE OR REPLACE FUNCTION move_conversation_to_workspace(
  p_conversation_id UUID,
  p_target_workspace_id UUID,
  p_user_id UUID
)
RETURNS workspace_conversations AS $$
DECLARE
  v_previous_workspace_id UUID;
  v_result workspace_conversations;
BEGIN
  -- Get current workspace if exists
  SELECT workspace_id INTO v_previous_workspace_id
  FROM workspace_conversations
  WHERE conversation_id = p_conversation_id;
  
  -- Delete existing mapping
  DELETE FROM workspace_conversations WHERE conversation_id = p_conversation_id;
  
  -- Insert new mapping
  INSERT INTO workspace_conversations (
    workspace_id,
    conversation_id,
    moved_at,
    moved_by,
    previous_workspace_id
  ) VALUES (
    p_target_workspace_id,
    p_conversation_id,
    now(),
    p_user_id,
    v_previous_workspace_id
  ) RETURNING * INTO v_result;
  
  -- Update denormalized workspace_id in conversations
  UPDATE conversations SET workspace_id = p_target_workspace_id WHERE id = p_conversation_id;
  
  -- Update stats for both workspaces
  IF v_previous_workspace_id IS NOT NULL THEN
    PERFORM update_workspace_stats(v_previous_workspace_id);
  END IF;
  PERFORM update_workspace_stats(p_target_workspace_id);
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create trigger to update workspace stats on message
-- ============================================

CREATE OR REPLACE FUNCTION trigger_update_workspace_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workspace stats when message is created
  IF TG_OP = 'INSERT' THEN
    PERFORM update_workspace_stats(c.workspace_id)
    FROM conversations c
    WHERE c.id = NEW.conversation_id AND c.workspace_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_workspace_on_message ON messages;
CREATE TRIGGER trg_update_workspace_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_workspace_on_message();

-- ============================================
-- 7. Migrate existing data
-- ============================================

-- Create default workspace for existing users if they don't have one
DO $$
DECLARE
  v_user RECORD;
  v_workspace_id UUID;
BEGIN
  FOR v_user IN SELECT DISTINCT user_id FROM conversations WHERE workspace_id IS NULL
  LOOP
    -- Check if user has a workspace
    SELECT id INTO v_workspace_id FROM workspaces WHERE owner_id = v_user.user_id LIMIT 1;
    
    -- If no workspace exists, create default one
    IF v_workspace_id IS NULL THEN
      INSERT INTO workspaces (owner_id, name, description)
      VALUES (v_user.user_id, 'Conversa con WADI', 'Tu espacio principal de trabajo')
      RETURNING id INTO v_workspace_id;
      
      -- Add user as member
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (v_workspace_id, v_user.user_id, 'owner');
    END IF;
    
    -- Assign all user's conversations without workspace to this default workspace
    INSERT INTO workspace_conversations (workspace_id, conversation_id)
    SELECT v_workspace_id, c.id
    FROM conversations c
    WHERE c.user_id = v_user.user_id AND c.workspace_id IS NULL
    ON CONFLICT (conversation_id) DO NOTHING;
    
    -- Update denormalized field
    UPDATE conversations SET workspace_id = v_workspace_id WHERE user_id = v_user.user_id AND workspace_id IS NULL;
  END LOOP;
END $$;
