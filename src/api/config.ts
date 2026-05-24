import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { env } from '../config/env';
import {
  applyFacePrefixToRequestUrl,
  getEffectiveFacePrefix,
} from './faceApiRouting';

let interceptorsSetup = false;

/** Avoid re-parsing `pathname` on every axios request when the URL has not changed. */
let cachedFacePathname = '';
let cachedFacePrefix = '';

function getMemoizedEffectiveFacePrefix(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const pathname = window.location.pathname;
  if (pathname !== cachedFacePathname) {
    cachedFacePathname = pathname;
    cachedFacePrefix = getEffectiveFacePrefix(pathname, env.defaultFacePrefix);
  }
  return cachedFacePrefix;
}

/** Clear face-prefix memo when user switches face (PSH1-B11). */
export function invalidateMemoizedFacePrefixCache(): void {
  cachedFacePathname = '';
  cachedFacePrefix = '';
}

/** PSH1-E03 — block HTTPS page calling HTTP API (mixed content). */
export function assertNoMixedContentApi(
  apiUrl: string,
  pageProtocol: string = typeof window !== 'undefined' ? window.location.protocol : 'https:'
): void {
  if (pageProtocol === 'https:' && apiUrl.startsWith('http://')) {
    throw new Error(
      'Mixed content blocked: HTTPS portal page cannot call HTTP API URL. Set VITE_API_URL to https://…'
    );
  }
}

/**
 * Configure API client with base URL from environment variables.
 * Sets up global axios request interceptor for face path routing (once).
 * Response interceptors (401 refresh) are registered via `setupAxiosInterceptors`.
 */
export function configureApiClient() {
  if (typeof window !== 'undefined') {
    assertNoMixedContentApi(env.apiUrl);
  }

  OpenAPI.BASE = env.apiUrl;
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = 'include';

  OpenAPI.HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!interceptorsSetup && typeof window !== 'undefined') {
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

        const face = getMemoizedEffectiveFacePrefix();
        config.url = applyFacePrefixToRequestUrl(u, face, env.apiUrl);

        return config as InternalAxiosRequestConfig;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    interceptorsSetup = true;
  }

  if (env.debugMode) {
    console.log(`API client configured with base URL: ${env.apiUrl}`);
  }
}

export function setAuthToken(token: string | null) {
  if (token) {
    OpenAPI.TOKEN = token;
    const currentHeaders =
      typeof OpenAPI.HEADERS === 'function' ? {} : OpenAPI.HEADERS || {};
    OpenAPI.HEADERS = {
      ...currentHeaders,
      Authorization: `Bearer ${token}`,
    };
  } else {
    OpenAPI.TOKEN = undefined;
    const currentHeaders =
      typeof OpenAPI.HEADERS === 'function' ? {} : OpenAPI.HEADERS || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Authorization, ...headers } = currentHeaders;
    OpenAPI.HEADERS = Object.keys(headers).length > 0 ? headers : undefined;
  }
}
