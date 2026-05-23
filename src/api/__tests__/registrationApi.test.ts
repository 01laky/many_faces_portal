import { describe, it, expect, vi } from 'vitest';
import { persistTokensFromRegistration } from '../registrationApi';
import { AUTH_STORAGE_KEYS } from '../../utils/authStorage';

vi.mock('../config', () => ({
  setAuthToken: vi.fn(),
}));

describe('registrationApi REF-A8', () => {
  it('persistTokensFromRegistration uses authStorage keys', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    });
    persistTokensFromRegistration({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 3600,
      userId: '1',
      email: 'a@b.c',
    });
    expect(store.get(AUTH_STORAGE_KEYS.TOKEN)).toBe('access');
    expect(store.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh');
  });
});
