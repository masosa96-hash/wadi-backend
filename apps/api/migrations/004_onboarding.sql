-- Migration: Onboarding and First-Time Experience (P8)
-- Description: Track user onboarding progress and first-time user states

-- ============================================
-- 1. Enhance profiles table for onboarding
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Index for filtering users by onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in onboarding (0-based index)';

-- ============================================
-- 2. Create onboarding_events table for analytics
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'onboarding_started',
      'step_viewed',
      'step_completed',
      'onboarding_completed',
      'onboarding_skipped',
      'permission_requested',
      'permission_granted',
      'permission_denied'
    )
  ),
  
  event_data JSONB DEFAULT '{}', -- Step number, permission type, etc.
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_user ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_type ON onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created ON onboarding_events(created_at DESC);

-- ============================================
-- 3. Create user_permissions table
-- ============================================

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  permission_type TEXT NOT NULL CHECK (
    permission_type IN ('microphone', 'camera', 'notifications', 'location')
  ),
  
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'granted', 'denied', 'revoked')
  ),
  
  requested_at TIMESTAMPTZ DEFAULT now(),
  granted_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, permission_type)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_status ON user_permissions(status);

-- ============================================
-- 4. Create function to mark onboarding complete
-- ============================================

CREATE OR REPLACE FUNCTION complete_user_onboarding(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE user_id = p_user_id;
  
  -- Log event
  INSERT INTO onboarding_events (user_id, event_type, event_data)
  VALUES (p_user_id, 'onboarding_completed', '{}');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create function to record login
-- ============================================

CREATE OR REPLACE FUNCTION record_user_login(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    last_login_at = now(),
    login_count = login_count + 1,
    first_login_at = COALESCE(first_login_at, now())
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create first-time tips/guides table
-- ============================================

CREATE TABLE IF NOT EXISTS first_time_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  tip_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  example_prompt TEXT,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default tips
INSERT INTO first_time_tips (tip_key, title, description, example_prompt, display_order) VALUES
  ('natural_language', '💬 Hablá con naturalidad', 'Escribile a WADI como le escribirías a un amigo', 'Che WADI, necesito ayuda con...', 1),
  ('dynamic_spaces', '📁 Espacios automáticos', 'WADI crea espacios de trabajo según tus conversaciones', NULL, 2),
  ('file_uploads', '📎 Próximamente: Archivos', 'Pronto podrás adjuntar PDFs, imágenes y documentos', NULL, 3),
  ('voice_input', '🎤 Próximamente: Voz', 'Próximamente podrás hablarle a WADI en lugar de escribir', NULL, 4)
ON CONFLICT (tip_key) DO NOTHING;

-- ============================================
-- 7. Create user_tips_seen table
-- ============================================

CREATE TABLE IF NOT EXISTS user_tips_seen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES first_time_tips(id) ON DELETE CASCADE,
  
  seen_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, tip_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tips_seen_user ON user_tips_seen(user_id);
