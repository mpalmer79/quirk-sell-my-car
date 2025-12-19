// Admin Authentication Types

export interface AdminUser {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: 'admin' | 'super_admin' | 'viewer';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_verified_at: string | null;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
}

export interface AdminSession {
  id: string;
  created_at: string;
  expires_at: string;
  admin_user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  two_factor_verified: boolean;
  is_revoked: boolean;
  revoked_at: string | null;
}

export interface AdminBackupCode {
  id: string;
  created_at: string;
  admin_user_id: string;
  code_hash: string;
  used_at: string | null;
}

export interface AdminAuditLog {
  id: string;
  created_at: string;
  admin_user_id: string | null;
  action: AdminAuditAction;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
}

export type AdminAuditAction =
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | '2fa_setup_started'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | '2fa_failed'
  | 'backup_code_used'
  | 'session_revoked'
  | 'account_locked'
  | 'account_unlocked';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  requires2FA: boolean;
  sessionToken?: string;
  user?: SafeAdminUser;
  error?: string;
}

export interface Verify2FARequest {
  sessionToken: string;
  code: string;
}

export interface Verify2FAResponse {
  success: boolean;
  error?: string;
}

export interface Setup2FAResponse {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  error?: string;
}

export interface Enable2FARequest {
  code: string;
}

export type SafeAdminUser = Omit
  AdminUser,
  'password_hash' | 'two_factor_secret' | 'password_reset_token' | 'password_reset_expires'
>;

export interface AdminAuthState {
  isAuthenticated: boolean;
  requires2FA: boolean;
  user: SafeAdminUser | null;
  isLoading: boolean;
}

export interface TwoFactorSetupState {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
  isVerified: boolean;
}
