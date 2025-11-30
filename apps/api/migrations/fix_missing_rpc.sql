-- ============================================================================
-- WADI - Missing RPC Function
-- ============================================================================
-- Run this in your Supabase SQL Editor to fix the authenticated chat error.

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
