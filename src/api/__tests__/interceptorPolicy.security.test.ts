import { describe, expect, it } from 'vitest';
import {
	isApiHostRequest,
	isOAuthTokenEndpoint,
	isRateLimitResponse,
	shouldForceLogoutOn403,
	shouldHandle401Refresh,
} from '../interceptorPolicy';

const API_BASE = 'https://api.example.com';

describe('interceptorPolicy (PSH1-T-A06, A07, A05)', () => {
	it('PSH1-T-A06: portal default — generic 403 does not force logout', () => {
		expect(shouldForceLogoutOn403(403)).toBe(false);
	});

	it('PSH1-T-A07: oauth token endpoint excluded from refresh handling', () => {
		expect(shouldHandle401Refresh(401, { url: '/api/oauth2/token' })).toBe(false);
	});

	it('PSH1-T-A05: 429 / rate_limit detected', () => {
		expect(isRateLimitResponse(429, null)).toBe(true);
		expect(isRateLimitResponse(400, { error: 'rate_limit' })).toBe(true);
		expect(isRateLimitResponse(401, null)).toBe(false);
	});

	it('401 eligible for refresh once', () => {
		expect(shouldHandle401Refresh(401, { url: '/api/stories' })).toBe(true);
		expect(shouldHandle401Refresh(401, { url: '/api/stories', _retry: true })).toBe(false);
	});

	it('oauth token endpoint detection', () => {
		expect(isOAuthTokenEndpoint('/api/oauth2/token')).toBe(true);
		expect(isApiHostRequest({ url: '/api/oauth2/token' }, API_BASE)).toBe(false);
		expect(isApiHostRequest({ url: '/api/stories' }, API_BASE)).toBe(true);
	});
});
