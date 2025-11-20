-- ============================================================================
-- WADI - Chat Conversations & Messages Schema
-- ============================================================================
-- This schema supports the main "Conversa con WADI" chat feature
-- User creates conversations with AI and each conversation has multiple messages
--
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Drop existing tables if re-running (optional, remove in production)
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;

-- ============================================================================
-- Table: conversations
-- Stores chat conversations for each user
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Optional title, can be auto-generated from first message
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Metadata
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ
);

-- ============================================================================
-- Table: messages
-- Stores individual messages in conversations (user and assistant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Metadata
  model TEXT, -- Which AI model was used (only for assistant messages)
  tokens_used INTEGER, -- Token usage for billing/tracking
  error TEXT -- If message generation failed
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- ============================================================================
-- Triggers: Auto-update timestamps and counts
-- ============================================================================

-- Update conversation.updated_at when modified
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    message_count = message_count + 1,
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Update conversation count when messages are deleted
CREATE OR REPLACE FUNCTION decrease_conversation_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    message_count = GREATEST(0, message_count - 1),
    updated_at = NOW()
  WHERE id = OLD.conversation_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_decrease_conversation_count
  AFTER DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION decrease_conversation_count_on_delete();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
CREATE POLICY conversations_select_own ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_update_own ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY conversations_delete_own ON conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Messages: Users can only access messages in their conversations
CREATE POLICY messages_select_own ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_own ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY messages_update_own ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY messages_delete_own ON messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Helper Function: Get or Create Default Conversation
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_default_conversation(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get the most recent conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE user_id = p_user_id
  ORDER BY updated_at DESC
  LIMIT 1;

  -- If no conversation exists, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user_id, title)
    VALUES (p_user_id, 'Conversa con WADI')
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Verification Queries (Run after creation to verify)
-- ============================================================================
-- SELECT * FROM conversations LIMIT 5;
-- SELECT * FROM messages LIMIT 10;
-- SELECT table_name, column_name, data_type FROM information_schema.columns 
--   WHERE table_name IN ('conversations', 'messages') ORDER BY table_name, ordinal_position;
