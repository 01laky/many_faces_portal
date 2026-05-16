/**
 * main.tsx - Application entry point for Frontend Demo
 *
 * Initialization order:
 * 1. Validate environment
 * 2. Load i18n from GET /api/localization/portal
 * 3. Reset face API static route cache (depends on loaded routes.*)
 * 4. Configure API client (interceptors)
 * 5. Render React tree
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

async function bootstrap() {
  try {
    await initI18n();
    resetLangLevelStaticRouteSegmentsCache();
    configureApiClient();

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
  } catch (err) {
    logger.error('Failed to bootstrap application', err);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML =
        '<div style="padding:2rem;font-family:system-ui">' +
        '<h1>Could not load translations</h1>' +
        '<p>Check that the API is running and reachable at <code>' +
        env.apiUrl +
        '</code>, then refresh.</p></div>';
    }
  }
}

void bootstrap();
