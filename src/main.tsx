/**
 * Application entry — bootstrap order (static i18n must load before face-scoped API calls):
 * 1. Validate environment variables
 * 2. GET /api/localization/portal (face-prefix exempt; cached by version in localStorage)
 * 3. initI18n + resetLangLevelStaticRouteSegmentsCache (routes.* for faceApiRouting)
 * 4. configureApiClient + axios interceptors
 * 5. Render React tree
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/appBrandFont.scss';
import './styles/main.scss';
import { initI18n } from './i18n/config';
import { configureApiClient } from './api/config';
import { setupAxiosInterceptors } from './api/interceptors';
import { resetLangLevelStaticRouteSegmentsCache } from './api/faceApiRouting';
import { validateEnv, logEnvConfig, env } from './config/env';
import { logger } from './utils/logger';
import { QueryProvider } from './providers/QueryProvider';
import { renderBootstrapError, renderBootstrapLoading } from './utils/bootstrapShell';
import App from './App.tsx';

validateEnv();
logEnvConfig();

async function bootstrap(): Promise<void> {
	const rootEl = document.getElementById('root');
	if (!rootEl) {
		throw new Error('Missing #root element');
	}

	renderBootstrapLoading(rootEl);

	try {
		await initI18n();
		resetLangLevelStaticRouteSegmentsCache();
		configureApiClient();
		setupAxiosInterceptors();

		logger.info('Frontend application started', {
			AppName: env.appName,
			AppVersion: env.appVersion,
			Environment: env.environment,
		});

		createRoot(rootEl).render(
			<StrictMode>
				<QueryProvider>
					<App />
				</QueryProvider>
			</StrictMode>
		);
	} catch (err) {
		logger.error('Failed to bootstrap application', err);
		renderBootstrapError(rootEl, env.apiUrl, () => {
			void bootstrap();
		});
	}
}

void bootstrap();
