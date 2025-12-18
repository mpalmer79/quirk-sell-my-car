import { NextResponse } from 'next/server';
import {
  getSecretsStatus,
  getRecentLogs,
  AuditSeverity,
  canUseAiChat,
  canUseCrmIntegration,
  maskSecret,
} from '@/lib/security';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
  }[];
  features: {
    aiChat: boolean;
    crmIntegration: boolean;
  };
  secrets?: {
    configured: string[];
    missing: string[];
  };
  recentErrors?: number;
}

const startTime = Date.now();

export async function GET(request: Request): Promise<NextResponse<HealthStatus>> {
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get('verbose') === 'true';
  const authHeader = request.headers.get('authorization');
  
  // Only show detailed info with auth in production
  const isAuthorized = process.env.NODE_ENV !== 'production' || 
    authHeader === `Bearer ${process.env.HEALTH_CHECK_SECRET}`;

  const checks: HealthStatus['checks'] = [];
  
  // Check environment
  const aiChat = canUseAiChat();
  const crm = canUseCrmIntegration();
  
  checks.push({
    name: 'ai_chat',
    status: aiChat.available ? 'pass' : 'warn',
    message: aiChat.available ? 'AI chat available' : aiChat.reason,
  });
  
  checks.push({
    name: 'crm_integration',
    status: crm.available ? 'pass' : 'warn',
    message: crm.available ? 'CRM integration available' : crm.reason,
  });

  // Check for recent errors
  const recentLogs = getRecentLogs(100);
  const recentErrors = recentLogs.filter(
    (log) => log.severity === AuditSeverity.ERROR || log.severity === AuditSeverity.CRITICAL
  ).length;
  
  checks.push({
    name: 'error_rate',
    status: recentErrors === 0 ? 'pass' : recentErrors < 10 ? 'warn' : 'fail',
    message: `${recentErrors} errors in recent logs`,
  });

  // Determine overall status
  const hasFailures = checks.some((c) => c.status === 'fail');
  const hasWarnings = checks.some((c) => c.status === 'warn');
  
  const status: HealthStatus = {
    status: hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    features: {
      aiChat: aiChat.available,
      crmIntegration: crm.available,
    },
  };

  // Add verbose info if authorized
  if (verbose && isAuthorized) {
    const secretsStatus = getSecretsStatus();
    status.secrets = {
      configured: secretsStatus.configured,
      missing: secretsStatus.missing,
    };
    status.recentErrors = recentErrors;
  }

  const httpStatus = status.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
