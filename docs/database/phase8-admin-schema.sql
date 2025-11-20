-- ============================================================================
-- PHASE 8: ADMIN PANEL SCHEMA
-- ============================================================================
-- This script creates the database schema for admin panel and analytics
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- Create admin_roles table (extending profiles)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK(role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_roles (only super admins can manage)
DROP POLICY IF EXISTS "Super admins can view all admin roles" ON admin_roles;
CREATE POLICY "Super admins can view all admin roles" ON admin_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can manage admin roles" ON admin_roles;
CREATE POLICY "Super admins can manage admin roles" ON admin_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for system_metrics (admins can view)
DROP POLICY IF EXISTS "Admins can view system metrics" ON system_metrics;
CREATE POLICY "Admins can view system metrics" ON system_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert metrics" ON system_metrics;
CREATE POLICY "System can insert metrics" ON system_metrics
  FOR INSERT
  WITH CHECK (true); -- Allow system to insert

-- RLS Policies for audit_logs (admins can view)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- Allow system to log

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system statistics
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_workspaces BIGINT,
  total_projects BIGINT,
  total_runs BIGINT,
  total_credits_used BIGINT,
  active_users_24h BIGINT,
  active_users_7d BIGINT,
  active_users_30d BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM auth.users)::BIGINT,
    (SELECT COUNT(*) FROM workspaces)::BIGINT,
    (SELECT COUNT(*) FROM projects)::BIGINT,
    (SELECT COUNT(*) FROM runs)::BIGINT,
    (SELECT COALESCE(SUM(credits_used), 0) FROM billing_info)::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM runs WHERE created_at > NOW() - INTERVAL '24 hours')::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM runs WHERE created_at > NOW() - INTERVAL '7 days')::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM runs WHERE created_at > NOW() - INTERVAL '30 days')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_metrics()
RETURNS TABLE (
  total_credits_purchased BIGINT,
  free_plan_users BIGINT,
  pro_plan_users BIGINT,
  business_plan_users BIGINT,
  monthly_recurring_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COALESCE(SUM(-amount), 0) FROM credit_usage_history WHERE reason = 'Credit purchase')::BIGINT,
    (SELECT COUNT(*) FROM billing_info WHERE plan = 'free')::BIGINT,
    (SELECT COUNT(*) FROM billing_info WHERE plan = 'pro')::BIGINT,
    (SELECT COUNT(*) FROM billing_info WHERE plan = 'business')::BIGINT,
    (
      (SELECT COUNT(*) FROM billing_info WHERE plan = 'pro') * 29 +
      (SELECT COUNT(*) FROM billing_info WHERE plan = 'business') * 99
    )::NUMERIC as mrr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity
CREATE OR REPLACE FUNCTION get_user_activity(p_user_id UUID)
RETURNS TABLE (
  total_runs BIGINT,
  total_projects BIGINT,
  total_workspaces BIGINT,
  credits_used BIGINT,
  last_active TIMESTAMP WITH TIME ZONE,
  account_age_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM runs WHERE user_id = p_user_id)::BIGINT,
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id)::BIGINT,
    (SELECT COUNT(*) FROM workspace_members WHERE user_id = p_user_id)::BIGINT,
    (SELECT credits_used FROM billing_info WHERE user_id = p_user_id)::BIGINT,
    (SELECT MAX(created_at) FROM runs WHERE user_id = p_user_id),
    (SELECT EXTRACT(DAY FROM NOW() - created_at)::INT FROM auth.users WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin dashboard
CREATE OR REPLACE VIEW admin_dashboard_summary AS
SELECT 
  'system_stats' as metric_category,
  jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_workspaces', (SELECT COUNT(*) FROM workspaces),
    'total_projects', (SELECT COUNT(*) FROM projects),
    'total_runs', (SELECT COUNT(*) FROM runs),
    'total_credits_used', (SELECT COALESCE(SUM(credits_used), 0) FROM billing_info)
  ) as metrics;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_roles IS 'Admin user roles and permissions';
COMMENT ON TABLE system_metrics IS 'System performance and usage metrics';
COMMENT ON TABLE audit_logs IS 'Audit trail of admin actions';
COMMENT ON FUNCTION get_system_stats IS 'Get overall system statistics';
COMMENT ON FUNCTION get_revenue_metrics IS 'Get revenue and billing metrics';
COMMENT ON FUNCTION get_user_activity IS 'Get detailed activity for a specific user';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- SELECT * FROM get_system_stats();
-- SELECT * FROM get_revenue_metrics();
-- SELECT * FROM admin_dashboard_summary;
