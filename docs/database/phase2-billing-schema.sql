-- ============================================================================
-- PHASE 2: BILLING & CREDITS SYSTEM SCHEMA
-- ============================================================================
-- This script creates the database schema for billing and credit management
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Create billing_info table
CREATE TABLE IF NOT EXISTS billing_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT CHECK(plan IN ('free', 'pro', 'business')) DEFAULT 'free' NOT NULL,
  credits INT DEFAULT 200 NOT NULL,
  credits_used INT DEFAULT 0 NOT NULL,
  renew_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit_usage_history table for tracking
CREATE TABLE IF NOT EXISTS credit_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_billing_info_user_id ON billing_info(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_history_user_id ON credit_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_history_created_at ON credit_usage_history(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_billing_info_updated_at ON billing_info;
CREATE TRIGGER update_billing_info_updated_at
    BEFORE UPDATE ON billing_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_info
DROP POLICY IF EXISTS "Users can view their own billing info" ON billing_info;
CREATE POLICY "Users can view their own billing info" ON billing_info
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own billing info" ON billing_info;
CREATE POLICY "Users can insert their own billing info" ON billing_info
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own billing info" ON billing_info;
CREATE POLICY "Users can update their own billing info" ON billing_info
  FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for credit_usage_history
DROP POLICY IF EXISTS "Users can view their own credit history" ON credit_usage_history;
CREATE POLICY "Users can view their own credit history" ON credit_usage_history
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert credit history" ON credit_usage_history;
CREATE POLICY "System can insert credit history" ON credit_usage_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Function to automatically create billing info for new users
CREATE OR REPLACE FUNCTION create_billing_info_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO billing_info (user_id, plan, credits, credits_used)
  VALUES (NEW.id, 'free', 200, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create billing info when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_billing ON auth.users;
CREATE TRIGGER on_auth_user_created_billing
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_billing_info_for_new_user();

-- Function to use credits
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INT;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM billing_info
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE billing_info
  SET 
    credits = credits - p_amount,
    credits_used = credits_used + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log usage
  INSERT INTO credit_usage_history (user_id, amount, reason, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_metadata);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add credits
  UPDATE billing_info
  SET 
    credits = credits + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log addition
  INSERT INTO credit_usage_history (user_id, amount, reason, metadata)
  VALUES (p_user_id, -p_amount, p_reason, p_metadata);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to renew credits monthly
CREATE OR REPLACE FUNCTION renew_monthly_credits()
RETURNS void AS $$
DECLARE
  v_plan_credits RECORD;
BEGIN
  -- Renew credits for all users whose renew_date has passed
  FOR v_plan_credits IN
    SELECT 
      user_id,
      CASE 
        WHEN plan = 'free' THEN 200
        WHEN plan = 'pro' THEN 5000
        WHEN plan = 'business' THEN 20000
        ELSE 200
      END as monthly_credits
    FROM billing_info
    WHERE renew_date <= NOW()
  LOOP
    UPDATE billing_info
    SET 
      credits = v_plan_credits.monthly_credits,
      credits_used = 0,
      renew_date = NOW() + INTERVAL '30 days',
      updated_at = NOW()
    WHERE user_id = v_plan_credits.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE billing_info IS 'User billing information and credit tracking';
COMMENT ON TABLE credit_usage_history IS 'Historical record of credit usage';
COMMENT ON COLUMN billing_info.plan IS 'Subscription plan: free (200), pro (5000), business (20000)';
COMMENT ON COLUMN billing_info.credits IS 'Remaining credits for current period';
COMMENT ON COLUMN billing_info.credits_used IS 'Total credits used in current period';
COMMENT ON FUNCTION use_credits IS 'Deduct credits from user account';
COMMENT ON FUNCTION add_credits IS 'Add credits to user account';
COMMENT ON FUNCTION renew_monthly_credits IS 'Scheduled function to renew credits monthly';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Run these queries to verify the schema was created correctly:
-- SELECT * FROM billing_info LIMIT 1;
-- SELECT * FROM credit_usage_history LIMIT 1;
-- SELECT use_credits(auth.uid(), 10, 'Test usage', '{"test": true}');
