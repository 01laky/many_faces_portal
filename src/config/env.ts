/**
 * Vite **import.meta.env** bridge: every runtime knob the SPA reads from `.env*` / CI variables lands here
 * so components import `env` instead of scattering `import.meta.env.VITE_*` strings (easier audits + tests).
 *
 * **Validation:** `collectEnvValidationErrors` is pure (Vitest); `validateEnv` logs and **throws in PROD**
 * only when misconfigured so broken builds fail fast. Dev mode prints hints but keeps the app bootable
 * so engineers can fix `.env.local` without rebuilding.
 *
 * **Seq in dev:** `seqUrl` defaults to `/seq-proxy` while `import.meta.env.DEV` is true so the browser talks
 * same-origin to Vite, which forwards to `VITE_SEQ_PROXY_TARGET` (see `vite.config.ts`). Production uses
 * absolute `VITE_SEQ_URL` when logging is enabled.
 */

/** Snapshot of all supported `VITE_*` variables after defaults are applied. */
export interface EnvConfig {
  /** Base URL for REST clients (OpenAPI `OpenAPI.BASE` wiring). Must be parseable by `new URL()`. */
  apiUrl: string;
  /**
   * First URL segment before `/api/...` for tenant-scoped routing on the **public** SPA (guest “face” host).
   * Example: `public` → requests hit `/public/api/...` when no face slug is in the path.
   */
  defaultFacePrefix: string;

  /** OAuth2 **client_id** registered with many_faces_backend (Resource Owner + refresh flows). */
  oauth2ClientId: string;
  /** OAuth2 **client_secret** (public demo — replace in real deployments; never commit production secrets). */
  oauth2ClientSecret: string;

  /** Seq ingestion / UI URL, or `/seq-proxy` in dev — validated only when `enableSeqLogging` is true. */
  seqUrl: string;
  /** When true, client logger may forward structured events to Seq (subject to logger implementation). */
  enableSeqLogging: boolean;

  appName: string;
  appVersion: string;
  /** Vite mode string (`development` / `production` / custom). */
  environment: string;

  /** Gates verbose `logEnvConfig` console output in dev. */
  debugMode: boolean;
}

/** Reads `import.meta.env[key]` with a string default when unset or empty. */
function getEnv(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/** Accepts `true` / `1` as truthy; any other explicit string is treated as false. */
function getBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/** Live singleton parsed once at module load — tests should override via `collectEnvValidationErrors` clones. */
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
 * Pure validator used by `validateEnv` and Vitest. Builds a human-readable string list (never throws).
 * Seq URL rules: invalid URLs are reported **only** when logging is enabled to avoid blocking installs
 * where Seq is intentionally off.
 */
export function collectEnvValidationErrors(cfg: EnvConfig): string[] {
  const errors: string[] = [];

  try {
    new URL(cfg.apiUrl);
  } catch {
    errors.push(`Invalid VITE_API_URL: ${cfg.apiUrl}`);
  }

  if (cfg.enableSeqLogging) {
    try {
      new URL(cfg.seqUrl);
    } catch {
      errors.push(`Invalid VITE_SEQ_URL: ${cfg.seqUrl}`);
    }
  }

  if (!cfg.oauth2ClientId) {
    errors.push('VITE_OAUTH2_CLIENT_ID is required');
  }

  if (!cfg.oauth2ClientSecret) {
    errors.push('VITE_OAUTH2_CLIENT_SECRET is required');
  }

  return errors;
}

/** Side effect: console + optional throw in production when `collectEnvValidationErrors` returns messages. */
export function validateEnv(): void {
  const errors = collectEnvValidationErrors(env);

  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:');
    errors.forEach((error) => console.error(`   - ${error}`));
    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration');
    }
  }
}

/** Pretty-prints selected keys when `debugMode` is on — avoid calling from hot paths. */
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
