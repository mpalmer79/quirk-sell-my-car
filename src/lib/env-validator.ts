/**
 * Environment Variable Validator
 * Fails fast on startup if required secrets are missing
 */

interface EnvConfig {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
}

const ENV_CONFIG: EnvConfig[] = [
  // Required for database
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true },
  
  // Optional but validated if present
  { name: 'RESEND_API_KEY', required: false },
  { name: 'EMAIL_FROM', required: false },
  { name: 'EMAIL_TO', required: false },
];

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name];

    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${config.name}`);
    }

    if (value && config.validator && !config.validator(value)) {
      errors.push(`Invalid value for environment variable: ${config.name}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertEnv(): void {
  const { valid, errors } = validateEnv();

  if (!valid) {
    console.error('❌ Environment validation failed:');
    errors.forEach((err) => console.error(`   - ${err}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    } else {
      console.warn('⚠️  Continuing in development mode with missing env vars');
    }
  } else {
    console.log('✅ Environment variables validated');
  }
}
