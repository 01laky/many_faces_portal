import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiConfig from '../../api/config';
import {
  AUTH_STORAGE_KEYS,
  clearAuthStorage,
  getAccessTokenFromStorage,
  getRefreshTokenFromStorage,
  persistAccessToken,
  persistRefreshToken,
  resolveHubAccessToken,
} from '../authStorage';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
    clear: () => m.clear(),
    get length() {
      return m.size;
    },
    key: () => null,
  } as Storage;
}

describe('authStorage REF-A', () => {
  beforeEach(() => {
    vi.spyOn(apiConfig, 'setAuthToken').mockImplementation(() => undefined);
  });

  it('REF-A1: getAccessTokenFromStorage null when missing', () => {
    expect(getAccessTokenFromStorage(memoryStorage())).toBeNull();
  });

  it('REF-A2: persistAccessToken writes token + applies axios header', () => {
    const storage = memoryStorage();
    persistAccessToken('jwt', storage, apiConfig.setAuthToken);
    expect(storage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBe('jwt');
    expect(apiConfig.setAuthToken).toHaveBeenCalledWith('jwt');
  });

  it('REF-A3: clearAuthStorage removes only token + refresh', () => {
    const storage = memoryStorage();
    storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 't');
    storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'r');
    storage.setItem('auth_user', '{"id":"1"}');
    clearAuthStorage(storage, apiConfig.setAuthToken);
    expect(storage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(storage.getItem('auth_user')).toBe('{"id":"1"}');
  });

  it('REF-A4: resolveHubAccessToken prefers ref over storage', () => {
    const storage = memoryStorage();
    storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored');
    expect(resolveHubAccessToken('in-memory', storage)).toBe('in-memory');
  });

  it('REF-A5: resolveHubAccessToken(null) falls back to storage', () => {
    const storage = memoryStorage();
    storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'stored');
    expect(resolveHubAccessToken(null, storage)).toBe('stored');
  });

  it('REF-A6: refresh token isolated from access token key', () => {
    const storage = memoryStorage();
    persistAccessToken('access', storage);
    persistRefreshToken('refresh', storage);
    expect(getAccessTokenFromStorage(storage)).toBe('access');
    expect(getRefreshTokenFromStorage(storage)).toBe('refresh');
  });
});
