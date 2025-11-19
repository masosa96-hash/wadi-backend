-- Migration: 002_beta_invitations_and_roles
-- Description: Add user roles and beta invitation system
-- Date: 2025-11-19

-- ============================================
-- ADD ROLE TO PROFILES
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Create index on role
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ============================================
-- BETA INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beta_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS beta_invitations_code_idx ON beta_invitations(code);
CREATE INDEX IF NOT EXISTS beta_invitations_email_idx ON beta_invitations(email);
CREATE INDEX IF NOT EXISTS beta_invitations_expires_at_idx ON beta_invitations(expires_at);
CREATE INDEX IF NOT EXISTS beta_invitations_created_by_idx ON beta_invitations(created_by);

-- Enable RLS (admin-only access via service role)
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;

-- Admin policy (users with role='admin' can manage invitations)
CREATE POLICY "Admins can view all invitations"
  ON beta_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create invitations"
  ON beta_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update invitations"
  ON beta_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete invitations"
  ON beta_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to validate invitation code
CREATE OR REPLACE FUNCTION validate_invitation_code(
  p_code TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM beta_invitations
  WHERE code = p_code;

  -- Check if exists
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check expiration
  IF v_invitation.expires_at IS NOT NULL AND v_invitation.expires_at < NOW() THEN
    RETURN false;
  END IF;

  -- Check uses
  IF v_invitation.max_uses IS NOT NULL AND v_invitation.current_uses >= v_invitation.max_uses THEN
    RETURN false;
  END IF;

  -- Check email match (if invitation is personalized)
  IF v_invitation.email IS NOT NULL AND v_invitation.email != p_email THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume invitation code
CREATE OR REPLACE FUNCTION consume_invitation_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invitation_id UUID;
BEGIN
  -- Increment use count
  UPDATE beta_invitations
  SET 
    current_uses = current_uses + 1,
    metadata = jsonb_set(
      metadata,
      '{used_by}',
      (COALESCE(metadata->'used_by', '[]'::jsonb) || jsonb_build_array(p_user_id::text))
    )
  WHERE code = p_code
  RETURNING id INTO v_invitation_id;

  -- Return success if updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate random invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous characters
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  -- Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  result := substr(result, 1, 4) || '-' || 
            substr(result, 5, 4) || '-' || 
            substr(result, 9, 4) || '-' || 
            substr(result, 13, 4) || '-' ||
            substr(result, 17, 4) || '-' || 
            substr(result, 21, 4) || '-' || 
            substr(result, 25, 4) || '-' || 
            substr(result, 29, 4);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE beta_invitations IS 'Beta invitation codes for controlled access';
COMMENT ON COLUMN beta_invitations.code IS 'Unique invitation code (32 chars, formatted)';
COMMENT ON COLUMN beta_invitations.created_by IS 'Admin user who created the invitation';
COMMENT ON COLUMN beta_invitations.email IS 'Optional: specific email address for personalized invitation';
COMMENT ON COLUMN beta_invitations.max_uses IS 'NULL for unlimited, otherwise max redemptions allowed';
COMMENT ON COLUMN beta_invitations.current_uses IS 'Number of times this code has been used';
COMMENT ON COLUMN beta_invitations.expires_at IS 'NULL for no expiration, otherwise expiration timestamp';
COMMENT ON COLUMN beta_invitations.metadata IS 'Additional data (source, notes, used_by array, etc.)';

COMMENT ON COLUMN profiles.role IS 'User role: "user" (default) or "admin"';
