import { describe, expect, it } from 'vitest';
import { resolveSafeInternalRedirectPath } from '../safeRedirect';

const ORIGIN = 'https://portal.example.com';

describe('safeRedirect (PSH1-T-A13)', () => {
	it('accepts internal localized face path', () => {
		expect(resolveSafeInternalRedirectPath('/en/acme/home', '/en/public/home', ORIGIN)).toBe(
			'/en/acme/home'
		);
	});

	it('accepts internal static localized path', () => {
		expect(resolveSafeInternalRedirectPath('/en/profile', '/en/public/home', ORIGIN)).toBe(
			'/en/profile'
		);
	});

	it('rejects external absolute URL', () => {
		expect(
			resolveSafeInternalRedirectPath('https://evil.example/phish', '/en/public/home', ORIGIN)
		).toBe('/en/public/home');
	});

	it('rejects login loop paths', () => {
		expect(resolveSafeInternalRedirectPath('/en/login', '/en/public/home', ORIGIN)).toBe(
			'/en/public/home'
		);
	});

	it('rejects javascript: payloads', () => {
		expect(resolveSafeInternalRedirectPath('javascript:alert(1)', '/en/public/home', ORIGIN)).toBe(
			'/en/public/home'
		);
	});
});
