-- Migration: User Memory System (P6)
-- Description: Store and manage user preferences, learned behaviors, and context

-- ============================================
-- 1. Create user_memory table
-- ============================================

CREATE TABLE IF NOT EXISTS user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Memory classification
  memory_type TEXT NOT NULL CHECK (
    memory_type IN ('preference', 'fact', 'style', 'context', 'skill', 'goal')
  ),
  category TEXT, -- 'tone', 'format', 'recurring_topic', 'expertise_area', etc.
  
  -- Content
  key TEXT NOT NULL, -- Unique identifier for this memory (e.g., 'preferred_tone', 'expertise_python')
  value TEXT NOT NULL, -- The actual content
  metadata JSONB DEFAULT '{}', -- Additional structured data
  
  -- Source and confidence
  source TEXT DEFAULT 'explicit' CHECK (
    source IN ('explicit', 'inferred', 'feedback', 'system')
  ),
  confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Context
  derived_from_conversation_id UUID REFERENCES conversations(id),
  examples JSONB, -- Array of example interactions that support this memory
  
  -- Usage tracking
  times_referenced INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Lifecycle
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- Optional expiration for temporary context
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique key per user
  UNIQUE(user_id, key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_memory_user ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_type ON user_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memory_category ON user_memory(category);
CREATE INDEX IF NOT EXISTS idx_user_memory_active ON user_memory(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_memory_confidence ON user_memory(confidence DESC);

COMMENT ON TABLE user_memory IS 'Stores learned preferences, facts, and context about users to personalize interactions';
COMMENT ON COLUMN user_memory.source IS 'How this memory was acquired (user told us, we inferred it, from feedback, system default)';
COMMENT ON COLUMN user_memory.confidence IS 'How confident we are about this memory (0-1), affects whether to use it';

-- ============================================
-- 2. Create function to get active user memory
-- ============================================

CREATE OR REPLACE FUNCTION get_user_memory_for_chat(p_user_id UUID)
RETURNS TABLE(
  memory_type TEXT,
  category TEXT,
  key TEXT,
  value TEXT,
  confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    um.memory_type,
    um.category,
    um.key,
    um.value,
    um.confidence
  FROM user_memory um
  WHERE um.user_id = p_user_id
    AND um.is_active = true
    AND (um.expires_at IS NULL OR um.expires_at > now())
    AND um.confidence >= 0.5 -- Only use memories we're reasonably confident about
  ORDER BY um.confidence DESC, um.times_referenced DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Create function to update memory usage
-- ============================================

CREATE OR REPLACE FUNCTION increment_memory_usage(p_memory_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_memory SET
    times_referenced = times_referenced + 1,
    last_used_at = now()
  WHERE id = p_memory_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Create function to upsert user memory
-- ============================================

CREATE OR REPLACE FUNCTION upsert_user_memory(
  p_user_id UUID,
  p_key TEXT,
  p_value TEXT,
  p_type TEXT DEFAULT 'preference',
  p_category TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'explicit',
  p_confidence FLOAT DEFAULT 1.0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS user_memory AS $$
DECLARE
  v_result user_memory;
BEGIN
  INSERT INTO user_memory (
    user_id, key, value, memory_type, category, source, confidence, metadata
  ) VALUES (
    p_user_id, p_key, p_value, p_type, p_category, p_source, p_confidence, p_metadata
  )
  ON CONFLICT (user_id, key) DO UPDATE SET
    value = EXCLUDED.value,
    confidence = EXCLUDED.confidence,
    metadata = EXCLUDED.metadata,
    source = EXCLUDED.source,
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create memory templates for new users
-- ============================================

CREATE TABLE IF NOT EXISTS memory_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  key TEXT UNIQUE NOT NULL,
  default_value TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default templates
INSERT INTO memory_templates (key, default_value, memory_type, category, description) VALUES
  ('preferred_tone', 'cercano y amigable', 'preference', 'communication', 'Tono preferido para las respuestas de WADI'),
  ('preferred_language', 'español argentino', 'preference', 'communication', 'Idioma y variante preferida'),
  ('response_length', 'conciso pero completo', 'preference', 'format', 'Longitud preferida de las respuestas'),
  ('emoji_usage', 'moderado', 'preference', 'style', 'Nivel de uso de emojis en respuestas')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 6. Function to initialize default memories for new user
-- ============================================

CREATE OR REPLACE FUNCTION initialize_user_memory(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_memory (user_id, key, value, memory_type, category, source, confidence)
  SELECT 
    p_user_id,
    mt.key,
    mt.default_value,
    mt.memory_type,
    mt.category,
    'system',
    0.8 -- System defaults have 0.8 confidence, can be overridden by user
  FROM memory_templates mt
  WHERE mt.is_active = true
  ON CONFLICT (user_id, key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Trigger to initialize memory on user creation
-- ============================================

CREATE OR REPLACE FUNCTION trigger_initialize_user_memory()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_user_memory(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_initialize_user_memory ON profiles;
CREATE TRIGGER trg_initialize_user_memory
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_user_memory();

-- Initialize memory for existing users
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT user_id FROM profiles
  LOOP
    PERFORM initialize_user_memory(v_user.user_id);
  END LOOP;
END $$;
