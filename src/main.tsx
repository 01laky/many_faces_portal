/**
 * main.tsx - Application entry point for Frontend Demo
 *
 * This is the first file executed when the application starts.
 * It performs:
 * - Environment validation and configuration
 * - API client setup
 * - Internationalization (i18n) initialization
 * - React application rendering
 *
 * Initialization order:
 * 1. Import styles and configuration modules
 * 2. Validate environment variables
 * 3. Configure API client with backend URL
 * 4. Initialize i18n translations
 * 5. Render React application
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.scss';
import './i18n/config'; // Initialize i18n - loads translation files and sets up i18next
import { configureApiClient } from './api/config'; // Configure API client - sets base URL and interceptors
import { validateEnv, logEnvConfig, env } from './config/env'; // Environment configuration - validates required env vars
import { logger } from './utils/logger'; // Initialize logger - sets up logging utility
import { QueryProvider } from './providers/QueryProvider';
import App from './App.tsx';

// Validate environment variables - ensures all required configuration is present
// Throws error if critical environment variables are missing
validateEnv();

// Log environment configuration (without sensitive data) for debugging
logEnvConfig();

// Configure API client on app startup
// Sets base URL, timeout, and request/response interceptors
configureApiClient();

// Log application startup with metadata
// This helps with debugging and monitoring application lifecycle
logger.info('Frontend application started', {
  AppName: env.appName,
  AppVersion: env.appVersion,
  Environment: env.environment,
});

// Render React application to DOM
// StrictMode enables additional React development checks and warnings
// QueryProvider wraps app with React Query for data fetching and caching
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);
