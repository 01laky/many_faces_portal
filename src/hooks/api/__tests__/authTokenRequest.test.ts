import { describe, it, expect } from 'vitest';
import { buildPasswordGrantTokenRequest } from '../authTokenRequest';

describe('buildPasswordGrantTokenRequest', () => {
  const base = {
    username: 'user@test.com',
    password: 'secret',
    clientId: 'cid',
    clientSecret: 'csec',
  };

  it('sets rememberMe true only when argument is strictly true', () => {
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: true }).rememberMe).toBe(true);
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: false }).rememberMe).toBe(false);
    expect(buildPasswordGrantTokenRequest({ ...base }).rememberMe).toBe(false);
    expect(buildPasswordGrantTokenRequest({ ...base, rememberMe: undefined }).rememberMe).toBe(
      false
    );
  });

  it('builds a password grant body with OAuth2 client credentials', () => {
    const req = buildPasswordGrantTokenRequest(base);
    expect(req).toEqual({
      grantType: 'password',
      username: base.username,
      password: base.password,
      rememberMe: false,
      clientId: base.clientId,
      clientSecret: base.clientSecret,
    });
  });
});
