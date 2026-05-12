/**
 * Ensures the OAuth2 password-grant payload builder normalizes **`rememberMe`** (strict boolean) and
 * forwards static grant fields expected by `OAuth2Service.postApiOauth2Token` / many_faces_backend token endpoint.
 */
import { describe, it, expect } from 'vitest';
import { buildPasswordGrantTokenRequest } from '../authTokenRequest';

describe('buildPasswordGrantTokenRequest', () => {
  const base = {
    username: 'u',
    password: 'p',
    clientId: 'cid',
    clientSecret: 'sec',
  };

  it('sets rememberMe true only when strictly true', () => {
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: true }).rememberMe).toBe(true);
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: undefined }).rememberMe).toBe(
      false
    );
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: false }).rememberMe).toBe(false);
  });

  it('includes password grant fields', () => {
    const r = buildPasswordGrantTokenRequest({ ...base, rememberMe: true });
    expect(r).toMatchObject({
      grantType: 'password',
      username: 'u',
      password: 'p',
      clientId: 'cid',
      clientSecret: 'sec',
      rememberMe: true,
    });
  });
});
