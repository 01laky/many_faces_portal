import { describe, expect, it } from 'vitest';
import { buildPasswordGrantTokenRequest } from '@/hooks/api/authTokenRequest';

describe('authTokenRequest rememberMe (PSH1-T-A11)', () => {
	it('rememberMe true → payload true', () => {
		const body = buildPasswordGrantTokenRequest({
			username: 'a@demo.com',
			password: 'x',
			rememberMe: true,
			clientId: 'c',
			clientSecret: 's',
		});
		expect(body.rememberMe).toBe(true);
	});

	it('rememberMe omitted/false → payload false', () => {
		expect(
			buildPasswordGrantTokenRequest({
				username: 'a@demo.com',
				password: 'x',
				clientId: 'c',
				clientSecret: 's',
			}).rememberMe
		).toBe(false);
	});
});
