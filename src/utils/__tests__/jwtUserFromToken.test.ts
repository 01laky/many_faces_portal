import { describe, it, expect } from 'vitest';
import { jwtUserFromToken } from '../jwtUserFromToken';

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('jwtUserFromToken REF-J', () => {
  it('REF-J1: valid JWT with sub + email → user object', () => {
    const token = makeJwt({ sub: 'user-1', email: 'a@example.com' });
    expect(jwtUserFromToken(token)).toEqual({
      id: 'user-1',
      email: 'a@example.com',
      firstName: undefined,
      lastName: undefined,
    });
  });

  it('REF-J2: legacy nameid claim fallback', () => {
    const token = makeJwt({ nameid: 'legacy-id', email: 'x@test.com' });
    expect(jwtUserFromToken(token)?.id).toBe('legacy-id');
  });

  it('REF-J3: missing email → fallback username param', () => {
    const token = makeJwt({ sub: 'only-sub' });
    expect(jwtUserFromToken(token, 'fallback@user.com')).toEqual({
      id: 'only-sub',
      email: 'fallback@user.com',
      firstName: undefined,
      lastName: undefined,
    });
  });

  it('REF-J4: malformed JWT → null', () => {
    expect(jwtUserFromToken('not-a-jwt')).toBeNull();
  });

  it('REF-J5: empty string token → null', () => {
    expect(jwtUserFromToken('')).toBeNull();
    expect(jwtUserFromToken(null)).toBeNull();
  });

  it('REF-J6: expired JWT still decodes user for display', () => {
    const token = makeJwt({ sub: 'u', email: 'e@x.com', exp: 1 });
    expect(jwtUserFromToken(token)?.email).toBe('e@x.com');
  });

  it('REF-J7: unicode email preserved', () => {
    const email = 'užívateľ@example.com';
    const token = makeJwt({ sub: 'u', email });
    expect(jwtUserFromToken(token)?.email).toBe(email);
  });

  it('REF-J8: given_name / family_name mapped', () => {
    const token = makeJwt({
      sub: 'u',
      email: 'e@x.com',
      given_name: 'Ada',
      family_name: 'Lovelace',
    });
    expect(jwtUserFromToken(token)).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });
});
