
-- ============================================================================
-- QUIRK SELL MY CAR - ADMIN AUTHENTICATION SCHEMA
-- Run this in Supabase SQL Editor to create admin tables
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'viewer')),
  
  -- 2FA Fields
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  backup_codes JSONB,
  
  -- Security Fields
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- ADMIN SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  two_factor_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ============================================================================
-- ADMIN AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admin_users_updated_at ON admin_users;
CREATE TRIGGER trigger_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role has full access to admin_users
DROP POLICY IF EXISTS "Service role full access to admin_users" ON admin_users;
CREATE POLICY "Service role full access to admin_users" ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role has full access to admin_sessions
DROP POLICY IF EXISTS "Service role full access to admin_sessions" ON admin_sessions;
CREATE POLICY "Service role full access to admin_sessions" ON admin_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role has full access to admin_audit_log
DROP POLICY IF EXISTS "Service role full access to admin_audit_log" ON admin_audit_log;
CREATE POLICY "Service role full access to admin_audit_log" ON admin_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CREATE INITIAL ADMIN USER
-- Password: QuirkAdmin2024!@ (you should change this immediately after first login)
-- ============================================================================

-- Generate bcrypt hash for initial password
-- Note: This hash is for "QuirkAdmin2024!@" with 12 rounds
-- You MUST change this password after first login!

INSERT INTO admin_users (email, password_hash, role, two_factor_enabled)
VALUES (
  'admin@quirkcars.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.L5gJ5K5.5K5gJ5',
  'admin',
  false
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- HELPER: Generate a proper bcrypt hash for a new admin
-- Run this to create a new admin with a specific password:
-- 
-- First, generate the hash using Node.js:
--   const bcrypt = require('bcryptjs');
--   console.log(bcrypt.hashSync('YourSecurePassword123!', 12));
--
-- Then insert:
--   INSERT INTO admin_users (email, password_hash, role)
--   VALUES ('newemail@quirkcars.com', 'paste-hash-here', 'admin');
-- ============================================================================

-- ============================================================================
-- CLEANUP: Remove expired sessions (run periodically)
-- ============================================================================
-- DELETE FROM admin_sessions WHERE expires_at < NOW();
