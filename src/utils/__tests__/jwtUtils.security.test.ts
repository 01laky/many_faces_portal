import { describe, expect, it } from 'vitest';
import { isTokenExpired } from '../jwtUtils';

function jwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('jwtUtils session edge cases (PSH1-T-A09, A10)', () => {
  it('PSH1-T-A10: malformed JWT treated as expired', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });

  it('PSH1-T-A09: expired JWT detected via exp', () => {
    const expired = jwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(isTokenExpired(expired)).toBe(true);
    const valid = jwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenExpired(valid)).toBe(false);
  });
});
