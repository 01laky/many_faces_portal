import { describe, expect, it } from 'vitest';
import { mapRegistrationHttpError } from '../registrationApi';

describe('registrationApi (PSH1-T-A14…A16)', () => {
	it('PSH1-T-A14: safe user-facing errors without stack traces', () => {
		const err = mapRegistrationHttpError(400, 'complete');
		expect(err.message).toBe('Registration complete failed');
		expect(err.stack).toBeDefined();
		expect(err.message).not.toContain('stack');
	});

	it('PSH1-T-A15: invalid prefill maps to safe message', () => {
		expect(mapRegistrationHttpError(404, 'prefill').message).toBe('Invalid registration link');
	});

	it('PSH1-T-A16: invite verify rate limit (429)', () => {
		const err = mapRegistrationHttpError(429, 'prefill');
		expect(err.message).toContain('Too many');
		expect(err.name).toBe('Error');
	});
});
