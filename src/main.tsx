/**
 * main.tsx - Application entry point for Frontend Demo
 *
 * Initialization order:
 * 1. Validate environment
 * 2. Configure API client (interceptors)
 * 3. Load active i18n bundle (`initI18n` — dynamic import)
 * 4. Render React tree
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.scss';
import { initI18n } from './i18n/config';
import { configureApiClient } from './api/config';
import { resetLangLevelStaticRouteSegmentsCache } from './api/faceApiRouting';
import { validateEnv, logEnvConfig, env } from './config/env';
import { logger } from './utils/logger';
import { QueryProvider } from './providers/QueryProvider';
import App from './App.tsx';

validateEnv();
logEnvConfig();
configureApiClient();

async function bootstrap() {
  await initI18n();
  resetLangLevelStaticRouteSegmentsCache();

  logger.info('Frontend application started', {
    AppName: env.appName,
    AppVersion: env.appVersion,
    Environment: env.environment,
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>
  );
}

void bootstrap();
