-- ============================================================================
-- WADI - Fix Missing Column
-- ============================================================================
-- Run this in your Supabase SQL Editor to fix the "column user_id does not exist" error.

-- Add user_id column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Verify if RLS policies need to be recreated (usually they auto-update if column is added, 
-- but if they were broken, this might fix them).
