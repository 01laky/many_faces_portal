import { describe, expect, it } from 'vitest';
import { redactLogProperties, redactSensitiveLogText } from '../logRedaction';

describe('logRedaction (PSH1-H1)', () => {
	it('redacts access_token query params in strings', () => {
		expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).toContain('[REDACTED]');
		expect(redactSensitiveLogText('hub?access_token=secret123&x=1')).not.toContain('secret123');
	});

	it('redacts sensitive property keys', () => {
		const out = redactLogProperties({ refreshToken: 'abc', userId: '1' });
		expect(out?.refreshToken).toBe('[REDACTED]');
		expect(out?.userId).toBe('1');
	});
});

describe('logRedaction — sensitive key matching (exhaustive)', () => {
	it.each([
		'token',
		'Token',
		'accessToken',
		'refreshToken',
		'password',
		'PASSWORD',
		'userPassword',
		'secret',
		'clientSecret',
		'authorization',
		'Authorization',
		'credential',
		'credentials',
		'livekitToken',
		'turnPassword',
	])('redacts the value of a sensitive key %s whole, at any value type', (key) => {
		// string, object and array values under a sensitive key are all replaced whole (not recursed).
		expect(redactLogProperties({ [key]: 'v' })?.[key]).toBe('[REDACTED]');
		expect(redactLogProperties({ [key]: { nested: 'v' } })?.[key]).toBe('[REDACTED]');
		expect(redactLogProperties({ [key]: ['v'] })?.[key]).toBe('[REDACTED]');
	});

	it.each(['userId', 'email', 'count', 'contentType', 'faceId', 'status'])(
		'preserves the non-sensitive key %s',
		(key) => {
			expect(redactLogProperties({ [key]: 'plain' })?.[key]).toBe('plain');
		}
	);
});

describe('logRedaction — token text in free strings (exhaustive)', () => {
	it.each([
		['?access_token=abc', '?access_token=[REDACTED]'],
		['?refresh_token=abc', '?refresh_token=[REDACTED]'],
		['?id_token=abc', '?id_token=[REDACTED]'],
		['?token=abc', '?token=[REDACTED]'],
		['?api_key=abc', '?api_key=[REDACTED]'],
		['?api-key=abc', '?api-key=[REDACTED]'],
		['?apikey=abc', '?apikey=[REDACTED]'],
	])('redacts query token %s', (input, expected) => {
		expect(redactSensitiveLogText(input)).toBe(expected);
	});

	it('stops a query-token redaction at & and whitespace, keeping the rest', () => {
		expect(redactSensitiveLogText('a?access_token=x.y-z&b=1')).toBe(
			'a?access_token=[REDACTED]&b=1'
		);
		expect(redactSensitiveLogText('access_token=x end')).toBe('access_token=[REDACTED] end');
	});

	it('redacts multiple distinct tokens in one string', () => {
		expect(redactSensitiveLogText('?access_token=a&z=1 refresh_token=b done')).toBe(
			'?access_token=[REDACTED]&z=1 refresh_token=[REDACTED] done'
		);
	});

	it.each(['Bearer eyJ.a-b_c', 'bearer ABC123==', 'authorization: Bearer x.y.z'])(
		'redacts a Bearer token in %s',
		(input) => {
			const out = redactSensitiveLogText(input);
			expect(out).toContain('[REDACTED]');
			expect(out).not.toMatch(/ABC123|eyJ|x\.y\.z/);
		}
	);

	it('leaves text with no secrets untouched', () => {
		expect(redactSensitiveLogText('GET /faces/1/albums 200 in 12ms')).toBe(
			'GET /faces/1/albums 200 in 12ms'
		);
		expect(redactSensitiveLogText('')).toBe('');
	});
});

describe('logRedaction — nesting, arrays, non-strings, cycles', () => {
	it('redacts sensitive keys and token strings at multiple nesting levels', () => {
		const out = redactLogProperties({
			userId: '1',
			level1: {
				password: 'p',
				level2: { note: 'see ?token=deep', items: ['ok', 'Authorization: Bearer zzz'] },
			},
		});
		const l1 = out?.level1 as Record<string, unknown>;
		expect(l1.password).toBe('[REDACTED]');
		const l2 = l1.level2 as Record<string, unknown>;
		expect(l2.note).toBe('see ?token=[REDACTED]');
		expect((l2.items as string[])[0]).toBe('ok');
		expect((l2.items as string[])[1]).toContain('[REDACTED]');
	});

	it('preserves non-string primitives', () => {
		const out = redactLogProperties({
			count: 5,
			ratio: 1.5,
			active: true,
			nothing: null,
			missing: undefined,
		});
		expect(out?.count).toBe(5);
		expect(out?.ratio).toBe(1.5);
		expect(out?.active).toBe(true);
		expect(out?.nothing).toBeNull();
		expect(out?.missing).toBeUndefined();
	});

	it('handles undefined input and an empty object', () => {
		expect(redactLogProperties(undefined)).toBeUndefined();
		expect(redactLogProperties({})).toEqual({});
	});

	it('does not infinite-loop on a cyclic object (depth guard)', () => {
		const a: Record<string, unknown> = { name: 'x', token: 'leak' };
		a.self = a;
		let out: Record<string, unknown> | undefined;
		expect(() => {
			out = redactLogProperties(a);
		}).not.toThrow();
		expect(out?.token).toBe('[REDACTED]');
	});
});
