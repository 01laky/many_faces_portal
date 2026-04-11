/**
 * Side-effecting auth/session helpers extracted from React hooks (`useAuthApi`) so they stay unit-testable
 * and can inject fake `Storage` / `setAuthToken` without jsdom-heavy providers.
 *
 * Storage contract (browser):
 * - `auth_token` — access JWT for API `Authorization` header (also mirrored via `setAuthToken`).
 * - `auth_refresh_token` — refresh token for OAuth2 `grant_type=refresh_token` (optional after login).
 * - `auth_user` — cleared alongside tokens when access token is expired or missing (see `readAuthTokenQueryValue`).
 *
 * All network calls use generated OpenAPI clients (`OAuth2Service`, `AuthService`) and map `ApiError` bodies
 * to `Error` for consistent React Query `onError` handling.
 */
import { AuthService, OAuth2Service, ApiError } from '../../api';
import type { OAuth2TokenRequest, RegisterModel } from '../../api';
import { setAuthToken } from '../../api/config';
import { logger } from '../../utils/logger';
import { isTokenExpired } from '../../utils/jwtUtils';
import { env } from '../../config/env';
import { buildPasswordGrantTokenRequest } from './authTokenRequest';

/** Narrow storage surface so Vitest can pass a plain `{ getItem, setItem, removeItem }` without full `Storage`. */
export type AuthWebStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Normalizes token payloads from `/api/oauth2/token` (codegen may surface `accessToken` or legacy `token`). */
interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}

/** Public self-service registration; returns raw API response (hook layer decides cache invalidation). */
export async function registerUser(data: RegisterModel): Promise<unknown> {
  logger.info('Registering user', { email: data.email });
  return AuthService.postApiAuthRegister({ requestBody: data });
}

/**
 * OAuth2 Resource Owner Password Credentials grant: exchanges username/password (+ optional `rememberMe`,
 * which the API may use to lengthen access-token TTL) for access/refresh tokens.
 *
 * On success: writes tokens to `storage` and updates the in-memory axios bearer via `setAuthToken`.
 * On `ApiError`: throws `Error` with OAuth `error_description` / `error` / `message` when present so UI
 * can show a single string without importing OpenAPI types in components.
 */
export async function runPasswordGrantLogin(
  credentials: {
    username: string;
    password: string;
    rememberMe?: boolean;
  },
  storage: AuthWebStorage = localStorage
): Promise<{ accessToken: string; refreshToken?: string }> {
  logger.info('Attempting login', { username: credentials.username });

  const tokenRequest = buildPasswordGrantTokenRequest({
    username: credentials.username,
    password: credentials.password,
    rememberMe: credentials.rememberMe,
    clientId: env.oauth2ClientId,
    clientSecret: env.oauth2ClientSecret,
  });

  let response;
  try {
    response = await OAuth2Service.postApiOauth2Token({
      requestBody: tokenRequest,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const errorMessage =
        error.body?.errorDescription ||
        error.body?.error ||
        error.body?.message ||
        error.message ||
        'Login failed';
      throw new Error(errorMessage, { cause: error });
    }
    throw error;
  }

  const tokenData = response as unknown as TokenResponse;
  const accessToken = tokenData.accessToken || (tokenData as unknown as { token?: string }).token;

  if (!accessToken) {
    throw new Error('No access token received from server');
  }

  setAuthToken(accessToken);
  storage.setItem('auth_token', accessToken);
  if (tokenData.refreshToken) {
    storage.setItem('auth_refresh_token', tokenData.refreshToken);
  }

  return {
    accessToken,
    refreshToken: tokenData.refreshToken,
  };
}

/**
 * React Query `queryFn` for `authKeys.token()`: reads persisted JWT, synchronizes axios default header,
 * and enforces client-side expiry so the SPA cannot keep firing authenticated requests with a dead token.
 *
 * - If missing or expired: clears all three auth keys from `storage`, calls `applyAuthToken(null)`, returns `null`.
 * - If valid: calls `applyAuthToken(token)` (keeps header aligned with cache) and returns `{ accessToken }`.
 */
export function readAuthTokenQueryValue(
  storage: AuthWebStorage = localStorage,
  tokenExpired: (jwt: string) => boolean = isTokenExpired,
  applyAuthToken: (t: string | null) => void = setAuthToken
): { accessToken: string } | null {
  const token = storage.getItem('auth_token');
  if (!token || tokenExpired(token)) {
    if (token) {
      storage.removeItem('auth_token');
      storage.removeItem('auth_refresh_token');
      storage.removeItem('auth_user');
      applyAuthToken(null);
    }
    return null;
  }
  applyAuthToken(token);
  return { accessToken: token };
}

/** Logout helper: clears axios bearer and all browser auth keys (idempotent). */
export function clearLocalAuthSession(
  storage: AuthWebStorage = localStorage,
  applyAuthToken: (t: string | null) => void = setAuthToken
): void {
  applyAuthToken(null);
  storage.removeItem('auth_token');
  storage.removeItem('auth_refresh_token');
  storage.removeItem('auth_user');
  logger.info('User logged out');
}

/**
 * Refresh grant using `auth_refresh_token` from `storage`. Updates access token (and refresh token if the
 * server rotates it). Throws if no refresh token — callers (`useRefreshToken`) should surface that as a
 * hard logout / re-login path.
 */
export async function runRefreshGrantLogin(
  storage: AuthWebStorage = localStorage
): Promise<{ accessToken: string; refreshToken?: string }> {
  const refreshToken = storage.getItem('auth_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  logger.info('Refreshing token');

  const tokenRequest: OAuth2TokenRequest = {
    grantType: 'refresh_token',
    refreshToken,
    clientId: env.oauth2ClientId,
    clientSecret: env.oauth2ClientSecret,
  };

  const response = await OAuth2Service.postApiOauth2Token({
    requestBody: tokenRequest,
  });

  const tokenData = response as unknown as TokenResponse;
  const accessToken = tokenData.accessToken || (tokenData as unknown as { token?: string }).token;

  if (!accessToken) {
    throw new Error('No access token received from server');
  }

  setAuthToken(accessToken);
  storage.setItem('auth_token', accessToken);
  if (tokenData.refreshToken) {
    storage.setItem('auth_refresh_token', tokenData.refreshToken);
  }

  return {
    accessToken,
    refreshToken: tokenData.refreshToken,
  };
}
