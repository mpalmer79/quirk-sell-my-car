import { supabaseAdmin, AdminUser, AdminSession, AuditLogEntry } from '@/lib/supabase';
import {
  generateSessionToken,
  getSessionExpiry,
  hashBackupCodes,
  getClientIp,
  getUserAgent,
  AuditAction,
} from './auth';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<AdminUser, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function incrementFailedAttempts(id: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('failed_login_attempts')
    .eq('id', id)
    .single();

  if (error || !data) return 0;

  const newCount = (data.failed_login_attempts || 0) + 1;
  await updateUser(id, { failed_login_attempts: newCount });
  return newCount;
}

export async function resetFailedAttempts(id: string): Promise<void> {
  await updateUser(id, {
    failed_login_attempts: 0,
    locked_until: null,
  });
}

export async function lockAccount(id: string, until: Date): Promise<void> {
  await updateUser(id, {
    locked_until: until.toISOString(),
  });
}

export async function updateLastLogin(id: string): Promise<void> {
  await updateUser(id, {
    last_login_at: new Date().toISOString(),
  });
}

// ============================================================================
// 2FA OPERATIONS
// ============================================================================

export async function storeTempSecret(userId: string, secret: string): Promise<boolean> {
  // Store secret temporarily - it won't be "enabled" until verified
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      two_factor_secret: secret,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return !error;
}

export async function enable2FA(
  userId: string,
  backupCodes: string[]
): Promise<boolean> {
  const hashedCodes = hashBackupCodes(backupCodes);

  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      two_factor_enabled: true,
      backup_codes: hashedCodes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return !error;
}

export async function disable2FA(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      backup_codes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return !error;
}

export async function consumeBackupCode(
  userId: string,
  codeIndex: number,
  currentCodes: string[]
): Promise<boolean> {
  // Remove the used code
  const updatedCodes = [...currentCodes];
  updatedCodes.splice(codeIndex, 1);

  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      backup_codes: updatedCodes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return !error;
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export async function createSession(
  userId: string,
  request: Request,
  twoFactorVerified: boolean = false
): Promise<{ token: string; expiresAt: Date } | null> {
  const token = generateSessionToken();
  const expiresAt = getSessionExpiry();

  const { error } = await supabaseAdmin.from('admin_sessions').insert({
    user_id: userId,
    token,
    two_factor_verified: twoFactorVerified,
    expires_at: expiresAt.toISOString(),
    ip_address: getClientIp(request),
    user_agent: getUserAgent(request),
  });

  if (error) {
    console.error('Failed to create session:', error);
    return null;
  }

  return { token, expiresAt };
}

export async function getSessionByToken(token: string): Promise<AdminSession | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  return data as AdminSession;
}

export async function updateSession(
  token: string,
  updates: Partial<Omit<AdminSession, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_sessions')
    .update(updates)
    .eq('token', token);

  return !error;
}

export async function deleteSession(token: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .eq('token', token);

  return !error;
}

export async function deleteAllUserSessions(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .eq('user_id', userId);

  return !error;
}

export async function cleanExpiredSessions(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) return 0;
  return data?.length || 0;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function logAuditEvent(
  action: AuditAction,
  request: Request,
  userId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabaseAdmin.from('admin_audit_log').insert({
      user_id: userId || null,
      action,
      details: details || null,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function getAuditLog(
  userId?: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  let query = supabaseAdmin
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data as AuditLogEntry[];
}
