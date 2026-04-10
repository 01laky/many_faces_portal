import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { env } from '../config/env';
import {
  applyFacePrefixToRequestUrl,
  getEffectiveFacePrefix,
} from './faceApiRouting';

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
    // Response interceptor: auto-logout on 401 (expired/invalid token)
    axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401 && localStorage.getItem('auth_token')) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }
    );

    // Request interceptor: prepend /{face}/ before /api/... (backend RoutingMiddleware)
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.url) return config as InternalAxiosRequestConfig;

        const u = config.url;
        const base = env.apiUrl.replace(/\/$/, '');
        const targetsApiHost =
          u.startsWith('/api/') ||
          u === '/api' ||
          u.startsWith('/hubs/') ||
          u === '/hubs' ||
          u.startsWith(`${base}/api/`) ||
          u.startsWith(`${base}/api?`) ||
          u === `${base}/api` ||
          u.startsWith(`${base}/hubs/`) ||
          u.startsWith(`${base}/hubs?`) ||
          u === `${base}/hubs`;

        if (!targetsApiHost) {
          return config as InternalAxiosRequestConfig;
        }

        const face = getEffectiveFacePrefix(window.location.pathname, env.defaultFacePrefix);
        config.url = applyFacePrefixToRequestUrl(u, face, env.apiUrl);

        return config as InternalAxiosRequestConfig;
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
