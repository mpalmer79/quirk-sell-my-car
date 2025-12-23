-- Password Reset Tokens Table
-- Run this in Supabase SQL Editor

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure token hash is unique
  CONSTRAINT unique_token_hash UNIQUE (token_hash)
);

-- Index for faster lookups
CREATE INDEX idx_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (API routes use service role)
CREATE POLICY "Service role full access to reset tokens"
  ON password_reset_tokens
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add cron job to clean up expired/used tokens (runs daily at 4 AM UTC)
SELECT cron.schedule(
  'cleanup-expired-reset-tokens',
  '0 4 * * *',
  $$DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used_at IS NOT NULL$$
);

-- Comment for documentation
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for admin users. Tokens expire after 1 hour and are single-use.';
