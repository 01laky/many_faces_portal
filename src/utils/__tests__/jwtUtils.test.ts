import { describe, it, expect, vi, afterEach } from 'vitest';
import { isTokenExpired } from '../jwtUtils';

/** Minimal JWT-shaped string: header.payload.signature (Base64URL not required; atob path uses standard base64 from btoa). */
function makeJwt(payloadObj: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  return `${header}.${payload}.x`;
}

describe('isTokenExpired', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when exp is missing (token treated as non-expiring for client UX)', () => {
    expect(isTokenExpired(makeJwt({ sub: 'u1' }))).toBe(false);
  });

  it('returns false when exp is in the future', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(makeJwt({ exp: future }))).toBe(false);
  });

  it('returns true when exp is in the past', () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    expect(isTokenExpired(makeJwt({ exp: past }))).toBe(true);
  });

  it('returns false when exp matches current instant (not strictly before now)', () => {
    vi.useFakeTimers();
    const nowSec = 1_700_000_000;
    vi.setSystemTime(nowSec * 1000);
    expect(isTokenExpired(makeJwt({ exp: nowSec }))).toBe(false);
  });

  it('returns true when exp is strictly before now', () => {
    vi.useFakeTimers();
    const nowSec = 1_700_000_000;
    vi.setSystemTime(nowSec * 1000);
    expect(isTokenExpired(makeJwt({ exp: nowSec - 1 }))).toBe(true);
  });

  it('returns true for malformed JWT strings', () => {
    expect(isTokenExpired('')).toBe(true);
    expect(isTokenExpired('not-a-jwt')).toBe(true);
    expect(isTokenExpired('only.two')).toBe(true);
    expect(isTokenExpired('a.b!!!.c')).toBe(true);
  });

  it('returns true when payload is not valid JSON after base64 decode', () => {
    const badPayload = btoa('{');
    const h = btoa('{}');
    expect(isTokenExpired(`${h}.${badPayload}.s`)).toBe(true);
  });
});
