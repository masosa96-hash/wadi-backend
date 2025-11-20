-- Migration: Monetization System - Plans and Usage Tracking (P9)
-- Description: Subscription plans, usage metrics, and billing infrastructure

-- ============================================
-- 1. Create subscription_plans table
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Plan identification
  plan_key TEXT UNIQUE NOT NULL, -- 'free', 'pro', 'business'
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Limits
  max_messages_per_month INTEGER, -- NULL or -1 for unlimited
  max_file_uploads_per_month INTEGER,
  max_file_size_mb INTEGER,
  max_workspaces INTEGER,
  max_storage_mb INTEGER,
  
  -- Features
  voice_input_enabled BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  advanced_ai_models BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  custom_branding BOOLEAN DEFAULT false,
  
  features JSONB DEFAULT '[]', -- Array of feature descriptions
  
  -- Pricing (for future payment integration)
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Stripe integration (future)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_order ON subscription_plans(display_order);

-- Insert default plans
INSERT INTO subscription_plans (
  plan_key, 
  display_name, 
  description,
  max_messages_per_month,
  max_file_uploads_per_month,
  max_file_size_mb,
  max_workspaces,
  max_storage_mb,
  voice_input_enabled,
  priority_support,
  advanced_ai_models,
  price_monthly,
  price_yearly,
  is_default,
  display_order,
  features
) VALUES
  (
    'free',
    'Free',
    'Perfecto para empezar a usar WADI',
    50, -- 50 messages/month
    5,  -- 5 files/month
    5,  -- 5 MB max file size
    3,  -- 3 workspaces
    50, -- 50 MB total storage
    false,
    false,
    false,
    0,
    0,
    true, -- Default plan
    1,
    '["Hasta 50 mensajes al mes", "5 archivos por mes", "3 espacios de trabajo", "Modelos básicos de IA"]'::jsonb
  ),
  (
    'pro',
    'Pro',
    'Para usuarios que necesitan más potencia',
    500, -- 500 messages/month
    50,  -- 50 files/month
    25,  -- 25 MB max file size
    20,  -- 20 workspaces
    500, -- 500 MB storage
    true,
    false,
    true,
    9.99,
    99.90,
    false,
    2,
    '["Hasta 500 mensajes al mes", "50 archivos por mes", "20 espacios de trabajo", "Entrada por voz", "Modelos avanzados de IA", "Archivos hasta 25 MB"]'::jsonb
  ),
  (
    'business',
    'Business',
    'Sin límites para equipos y profesionales',
    -1, -- Unlimited
    -1, -- Unlimited
    100, -- 100 MB max file size
    -1, -- Unlimited workspaces
    -1, -- Unlimited storage
    true,
    true,
    true,
    29.99,
    299.90,
    false,
    3,
    '["Mensajes ilimitados", "Archivos ilimitados", "Espacios ilimitados", "Entrada por voz", "Soporte prioritario", "Modelos avanzados de IA", "Acceso API", "Archivos hasta 100 MB"]'::jsonb
  )
ON CONFLICT (plan_key) DO NOTHING;

-- ============================================
-- 2. Create user_subscriptions table
-- ============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')
  ),
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT now(),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Billing (future Stripe integration)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  payment_method TEXT, -- 'stripe', 'paypal', etc.
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

-- ============================================
-- 3. Create usage_metrics table
-- ============================================

CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Message usage
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0, -- Estimated OpenAI tokens
  
  -- File usage
  files_uploaded INTEGER DEFAULT 0,
  total_file_size_mb DECIMAL(10,2) DEFAULT 0,
  
  -- Workspace usage
  workspaces_created INTEGER DEFAULT 0,
  active_workspaces INTEGER DEFAULT 0,
  
  -- Feature usage
  voice_inputs_used INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  
  -- Model usage breakdown
  model_usage JSONB DEFAULT '{}', -- { "gpt-3.5-turbo": 45, "gpt-4": 5 }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_period ON usage_metrics(user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_start DESC);

-- ============================================
-- 4. Create usage_events table (detailed log)
-- ============================================

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'message_sent',
      'file_uploaded',
      'workspace_created',
      'voice_input_used',
      'api_call_made'
    )
  ),
  
  -- Resource consumed
  quantity DECIMAL(10,2) DEFAULT 1, -- 1 message, 5.2 MB file, etc.
  unit TEXT, -- 'messages', 'mb', 'tokens', 'calls'
  
  -- Context
  resource_id UUID, -- ID of message, file, workspace, etc.
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON usage_events(created_at DESC);

-- ============================================
-- 5. Function to get or create current usage period
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_current_usage(p_user_id UUID)
RETURNS usage_metrics AS $$
DECLARE
  v_period_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  v_period_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  v_metrics usage_metrics;
BEGIN
  SELECT * INTO v_metrics 
  FROM usage_metrics
  WHERE user_id = p_user_id 
    AND period_start = v_period_start;
  
  IF NOT FOUND THEN
    INSERT INTO usage_metrics (user_id, period_start, period_end)
    VALUES (p_user_id, v_period_start, v_period_end)
    RETURNING * INTO v_metrics;
  END IF;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Function to get user's active subscription with plan details
-- ============================================

CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_id UUID,
  plan_key TEXT,
  status TEXT,
  max_messages_per_month INTEGER,
  max_file_uploads_per_month INTEGER,
  max_file_size_mb INTEGER,
  max_workspaces INTEGER,
  voice_input_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id as subscription_id,
    sp.id as plan_id,
    sp.plan_key,
    us.status,
    sp.max_messages_per_month,
    sp.max_file_uploads_per_month,
    sp.max_file_size_mb,
    sp.max_workspaces,
    sp.voice_input_enabled
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Function to check if user is within limits
-- ============================================

CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_limit_type TEXT, -- 'messages', 'files', 'workspaces'
  p_increment INTEGER DEFAULT 1
)
RETURNS TABLE(
  within_limit BOOLEAN,
  current_usage INTEGER,
  limit_value INTEGER,
  remaining INTEGER
) AS $$
DECLARE
  v_subscription RECORD;
  v_metrics usage_metrics;
  v_current INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get subscription and limits
  SELECT * INTO v_subscription FROM get_user_active_subscription(p_user_id);
  
  -- If no subscription, assign default free plan
  IF NOT FOUND THEN
    SELECT * INTO v_subscription 
    FROM subscription_plans 
    WHERE is_default = true 
    LIMIT 1;
  END IF;
  
  -- Get current usage
  v_metrics := get_or_create_current_usage(p_user_id);
  
  -- Check specific limit
  CASE p_limit_type
    WHEN 'messages' THEN
      v_current := v_metrics.messages_sent;
      v_limit := v_subscription.max_messages_per_month;
    WHEN 'files' THEN
      v_current := v_metrics.files_uploaded;
      v_limit := v_subscription.max_file_uploads_per_month;
    WHEN 'workspaces' THEN
      v_current := v_metrics.active_workspaces;
      v_limit := v_subscription.max_workspaces;
    ELSE
      RAISE EXCEPTION 'Invalid limit type: %', p_limit_type;
  END CASE;
  
  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN QUERY SELECT true, v_current, v_limit, -1;
    RETURN;
  END IF;
  
  -- Check if within limit
  RETURN QUERY SELECT 
    (v_current + p_increment) <= v_limit,
    v_current,
    v_limit,
    GREATEST(0, v_limit - v_current);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Function to track usage event
-- ============================================

CREATE OR REPLACE FUNCTION track_usage_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_quantity DECIMAL DEFAULT 1,
  p_unit TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  v_metrics usage_metrics;
BEGIN
  -- Get or create current period metrics
  v_metrics := get_or_create_current_usage(p_user_id);
  
  -- Log usage event
  INSERT INTO usage_events (user_id, event_type, quantity, unit, resource_id, metadata)
  VALUES (p_user_id, p_event_type, p_quantity, p_unit, p_resource_id, p_metadata);
  
  -- Update aggregated metrics
  CASE p_event_type
    WHEN 'message_sent' THEN
      UPDATE usage_metrics SET
        messages_sent = messages_sent + 1,
        tokens_used = tokens_used + COALESCE((p_metadata->>'tokens')::INTEGER, 0),
        updated_at = now()
      WHERE id = v_metrics.id;
      
    WHEN 'file_uploaded' THEN
      UPDATE usage_metrics SET
        files_uploaded = files_uploaded + 1,
        total_file_size_mb = total_file_size_mb + p_quantity,
        updated_at = now()
      WHERE id = v_metrics.id;
      
    WHEN 'workspace_created' THEN
      UPDATE usage_metrics SET
        workspaces_created = workspaces_created + 1,
        active_workspaces = (SELECT COUNT(*) FROM workspaces WHERE owner_id = p_user_id AND is_archived = false),
        updated_at = now()
      WHERE id = v_metrics.id;
      
    WHEN 'voice_input_used' THEN
      UPDATE usage_metrics SET
        voice_inputs_used = voice_inputs_used + 1,
        updated_at = now()
      WHERE id = v_metrics.id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Initialize subscriptions for existing users
-- ============================================

DO $$
DECLARE
  v_user RECORD;
  v_default_plan_id UUID;
BEGIN
  -- Get default free plan
  SELECT id INTO v_default_plan_id FROM subscription_plans WHERE is_default = true LIMIT 1;
  
  -- Create subscriptions for users without one
  FOR v_user IN 
    SELECT user_id FROM profiles 
    WHERE NOT EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = profiles.user_id
    )
  LOOP
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (v_user.user_id, v_default_plan_id, 'active');
  END LOOP;
END $$;

-- ============================================
-- 10. Create trigger to auto-assign plan to new users
-- ============================================

CREATE OR REPLACE FUNCTION trigger_create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_default_plan_id UUID;
BEGIN
  SELECT id INTO v_default_plan_id FROM subscription_plans WHERE is_default = true LIMIT 1;
  
  INSERT INTO user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, v_default_plan_id, 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_default_subscription ON profiles;
CREATE TRIGGER trg_create_default_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_subscription();
