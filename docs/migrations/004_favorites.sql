-- WADI P4: Favorites Table Migration
-- Creates the favorites table for storing user-favorited messages

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: user can only favorite a message once
  UNIQUE(user_id, message_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_message_id ON favorites(message_id);
CREATE INDEX IF NOT EXISTS idx_favorites_conversation_id ON favorites(conversation_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create own favorites"
  ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON favorites TO authenticated;
GRANT ALL ON favorites TO service_role;

-- Comments
COMMENT ON TABLE favorites IS 'Stores user-favorited messages for quick access';
COMMENT ON COLUMN favorites.user_id IS 'User who favorited the message';
COMMENT ON COLUMN favorites.message_id IS 'ID of the favorited message';
COMMENT ON COLUMN favorites.conversation_id IS 'Conversation containing the favorited message';
COMMENT ON COLUMN favorites.created_at IS 'When the message was favorited';
