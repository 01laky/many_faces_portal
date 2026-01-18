import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { env } from '../config/env';
import { supportedLanguages } from '../i18n/config';

// Track if interceptors have been set up
let interceptorsSetup = false;

/**
 * Configure API client with base URL from environment variables
 * Sets up global axios interceptors for face path routing.
 * This should be called once when the app starts
 */
export function configureApiClient() {
  // Configure OpenAPI client
  OpenAPI.BASE = env.apiUrl;
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = 'include';
  
  // You can set default headers here if needed
  OpenAPI.HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Set up global axios interceptors for face path routing (only once)
  if (!interceptorsSetup && typeof window !== 'undefined') {
    // Request interceptor: prepend face path to API request URLs
    axios.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // Only process requests to API base URL (not external URLs)
        const isApiRequest = config.url && (
          config.url.startsWith('/api/') || 
          config.url.startsWith(env.apiUrl) ||
          (config.baseURL && config.baseURL.startsWith(env.apiUrl))
        );

        if (isApiRequest && config.url) {
          // Extract face path from current window location
          // Handles language prefix routes: /en/login, /sk/prihlasenie, /cz/prihlaseni
          // Handles face prefix routes: /acme-corp/dashboard, /acme-corp/en/login
          // 
          // Examples:
          // - /en/login -> facePath = null (language prefix, no face)
          // - /acme-corp/dashboard -> facePath = 'acme-corp' (face prefix)
          // - /acme-corp/en/login -> facePath = 'acme-corp' (face prefix + language)
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          
          // Use supported languages from i18n config to identify language prefixes
          // Language codes should not be treated as face paths
          const languageCodes = supportedLanguages as readonly string[];
          
          // Check if first segment is a language code
          const firstSegment = pathSegments.length > 0 ? pathSegments[0] : null;
          const isLanguagePrefix = firstSegment && languageCodes.includes(firstSegment.toLowerCase());
          
          // Determine face path:
          // - If first segment is language code -> facePath = null (no face prefix, language-only route)
          // - If first segment is NOT language code -> facePath = firstSegment (it's the face prefix)
          // - If no valid segments, no face path
          const facePath = isLanguagePrefix 
            ? null  // Language prefix route: /en/login -> no face path
            : firstSegment;  // Face prefix route: /acme-corp/... -> facePath = 'acme-corp'

          // If face path exists and URL doesn't already contain it, insert it after /api
          if (facePath && !config.url.includes(`/${facePath}/`)) {
            // Insert face path after /api prefix
            // Example: /api/users -> /api/acme-corp/users
            // Example: /api/auth/login -> /api/acme-corp/auth/login
            if (config.url.startsWith('/api/')) {
              // Insert face path after /api prefix
              config.url = config.url.replace('/api/', `/api/${facePath}/`);
            } else {
              // If URL doesn't start with /api/, prepend /api/facePath
              config.url = `/api/${facePath}${config.url}`;
            }
          }
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    interceptorsSetup = true;
  }
  
  if (env.debugMode) {
    console.log(`API client configured with base URL: ${env.apiUrl}`);
  }
}

/**
 * Set authentication token for API requests
 */
export function setAuthToken(token: string | null) {
  if (token) {
    OpenAPI.TOKEN = token
    // Add Authorization header
    const currentHeaders = typeof OpenAPI.HEADERS === 'function' 
      ? {} 
      : (OpenAPI.HEADERS || {})
    OpenAPI.HEADERS = {
      ...currentHeaders,
      'Authorization': `Bearer ${token}`,
    }
  } else {
    OpenAPI.TOKEN = undefined
    // Remove Authorization header
    const currentHeaders = typeof OpenAPI.HEADERS === 'function' 
      ? {} 
      : (OpenAPI.HEADERS || {})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Authorization, ...headers } = currentHeaders
    OpenAPI.HEADERS = Object.keys(headers).length > 0 ? headers : undefined
  }
}
