/**
 * Client-side JWT **exp** inspection used before attaching `Authorization` headers. Tests pin fake time
 * (`vi.setSystemTime`) and craft unsigned base64url tokens — **not** a crypto/security review of JWT,
 * only parsing + clock skew semantics for `isTokenExpired`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTokenExpired } from '../jwtUtils';

function makeJwt(payload: Record<string, unknown>): string {
	const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
	const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${header}.${body}.sig`;
}

describe('isTokenExpired', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns true when fewer than two segments', () => {
		expect(isTokenExpired('not-a-jwt')).toBe(true);
	});

	it('returns true for empty token', () => {
		expect(isTokenExpired('')).toBe(true);
	});

	it('returns true when payload is not valid JSON after decode', () => {
		expect(isTokenExpired('xx.yy.zz')).toBe(true);
	});

	it('returns true on malformed payload JSON', () => {
		expect(isTokenExpired('e30.!!!.sig')).toBe(true);
	});

	it('returns false when exp is missing', () => {
		const jwt = makeJwt({ sub: 'x' });
		expect(isTokenExpired(jwt)).toBe(false);
	});

	it('returns true when exp is in the past', () => {
		const jwt = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
		expect(isTokenExpired(jwt)).toBe(true);
	});

	it('returns false when exp is in the future', () => {
		const jwt = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
		expect(isTokenExpired(jwt)).toBe(false);
	});

	it('returns true when exp equals current second (RFC 7519: not before exp)', () => {
		const nowSec = Math.floor(Date.now() / 1000);
		const jwt = makeJwt({ exp: nowSec });
		expect(isTokenExpired(jwt)).toBe(true);
	});
});
