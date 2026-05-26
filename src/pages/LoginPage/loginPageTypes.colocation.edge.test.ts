import { describe, expect, it } from 'vitest';
import type { LoginFormData } from './types';

describe('LoginPage colocated form data type', () => {
	it('requires email, password, and rememberMe', () => {
		const data: LoginFormData = {
			email: 'user@demo.com',
			password: 'secret',
			rememberMe: true,
		};
		expect(data.email).toBe('user@demo.com');
		expect(data.rememberMe).toBe(true);
	});

	it('allows rememberMe false for guest-style sessions', () => {
		const data: LoginFormData = {
			email: 'guest@demo.com',
			password: 'x',
			rememberMe: false,
		};
		expect(data.rememberMe).toBe(false);
	});
});
