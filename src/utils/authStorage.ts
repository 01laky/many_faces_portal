import { setAuthToken } from '../api/config';

/** Browser localStorage keys for portal SPA OAuth session (tokens only — no cached user JSON). */
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
} as const;

/** @deprecated Legacy key removed by migration — do not write. */
export const LEGACY_AUTH_USER_KEY = 'auth_user';

export type AuthWebStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getAccessTokenFromStorage(storage: AuthWebStorage = localStorage): string | null {
  return storage.getItem(AUTH_STORAGE_KEYS.TOKEN);
}

export function getRefreshTokenFromStorage(storage: AuthWebStorage = localStorage): string | null {
  return storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

export function persistAccessToken(
  token: string,
  storage: AuthWebStorage = localStorage,
  applyAuthToken: (t: string | null) => void = setAuthToken
): void {
  applyAuthToken(token);
  storage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
}

export function persistRefreshToken(token: string, storage: AuthWebStorage = localStorage): void {
  storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
}

/** Clears bearer header and OAuth token keys (not legacy keys — use migration helper). */
export function clearAuthStorage(
  storage: AuthWebStorage = localStorage,
  applyAuthToken: (t: string | null) => void = setAuthToken
): void {
  applyAuthToken(null);
  storage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

/** SignalR hubs: prefer React ref, fall back to storage on reconnect. */
export function resolveHubAccessToken(
  inMemoryToken: string | null,
  storage: AuthWebStorage = localStorage
): string | null {
  return inMemoryToken ?? getAccessTokenFromStorage(storage);
}

export function hasAccessTokenInStorage(storage: AuthWebStorage = localStorage): boolean {
  return Boolean(getAccessTokenFromStorage(storage));
}
