/**
 * Environment configuration
 * Centralized place for all environment variables with validation and defaults
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  /** URL segment for tenant API routes when the path has no face (e.g. public → /public/api/...). */
  defaultFacePrefix: string;

  // OAuth2 Configuration
  oauth2ClientId: string;
  oauth2ClientSecret: string;

  // Seq Logging Configuration
  seqUrl: string;
  enableSeqLogging: boolean;

  // Application Configuration
  appName: string;
  appVersion: string;
  environment: string;

  // Development Configuration
  debugMode: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  // API Configuration
  apiUrl: getEnv('VITE_API_URL', 'https://localhost:8001'),
  defaultFacePrefix: getEnv('VITE_DEFAULT_FACE_PREFIX', 'public'),

  // OAuth2 Configuration
  oauth2ClientId: getEnv('VITE_OAUTH2_CLIENT_ID', 'be-demo-client'),
  oauth2ClientSecret: getEnv('VITE_OAUTH2_CLIENT_SECRET', 'be-demo-secret-very-strong-key'),

  // Seq Logging Configuration
  // In dev, always use Vite proxy (same-origin) to avoid CORS/503
  seqUrl: import.meta.env.DEV ? '/seq-proxy' : getEnv('VITE_SEQ_URL', 'http://localhost:5342'),
  enableSeqLogging: getBoolEnv('VITE_ENABLE_SEQ_LOGGING', false),

  // Application Configuration
  appName: getEnv('VITE_APP_NAME', 'Be Demo Frontend'),
  appVersion: getEnv('VITE_APP_VERSION', '1.0.0'),
  environment: import.meta.env.MODE || 'development',

  // Development Configuration
  debugMode: getBoolEnv('VITE_DEBUG_MODE', false),
};

/**
 * Validate critical environment variables
 */
export function validateEnv(): void {
  const errors: string[] = [];

  // Validate API URL format
  try {
    new URL(env.apiUrl);
  } catch {
    errors.push(`Invalid VITE_API_URL: ${env.apiUrl}`);
  }

  // Validate Seq URL format if logging is enabled
  if (env.enableSeqLogging) {
    try {
      new URL(env.seqUrl);
    } catch {
      errors.push(`Invalid VITE_SEQ_URL: ${env.seqUrl}`);
    }
  }

  // Validate OAuth2 credentials are not empty
  if (!env.oauth2ClientId) {
    errors.push('VITE_OAUTH2_CLIENT_ID is required');
  }

  if (!env.oauth2ClientSecret) {
    errors.push('VITE_OAUTH2_CLIENT_SECRET is required');
  }

  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:');
    errors.forEach((error) => console.error(`   - ${error}`));
    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration');
    }
  }
}

/**
 * Log environment configuration (only in development)
 */
export function logEnvConfig(): void {
  if (import.meta.env.DEV && env.debugMode) {
    console.log('🔧 Environment Configuration:');
    console.log(`   API URL: ${env.apiUrl}`);
    console.log(`   Seq URL: ${env.seqUrl}`);
    console.log(`   Seq Logging: ${env.enableSeqLogging ? 'enabled' : 'disabled'}`);
    console.log(`   OAuth2 Client ID: ${env.oauth2ClientId}`);
    console.log(`   App Name: ${env.appName}`);
    console.log(`   App Version: ${env.appVersion}`);
    console.log(`   Environment: ${env.environment}`);
    console.log(`   Debug Mode: ${env.debugMode ? 'enabled' : 'disabled'}`);
  }
}
