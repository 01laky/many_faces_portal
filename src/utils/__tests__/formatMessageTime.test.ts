import { describe, it, expect } from 'vitest';
import { formatMessageTime } from '../formatMessageTime';

/**
 * Edge-case coverage for the messenger timestamp formatter (previously untested). `now` is injected for
 * stable day boundaries; ISO strings are timezone-local so the same-day branch is deterministic in CI.
 */

const MONTHS = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;

describe('formatMessageTime', () => {
	it('returns an empty string for nullish input', () => {
		expect(formatMessageTime(null)).toBe('');
		expect(formatMessageTime(undefined)).toBe('');
		expect(formatMessageTime('')).toBe('');
	});

	it('returns an empty string for an unparseable date', () => {
		expect(formatMessageTime('not-a-date')).toBe('');
		expect(formatMessageTime('2026-13-45T99:99:99')).toBe('');
	});

	it('formats a same-day timestamp as time only (no month)', () => {
		const now = new Date('2026-06-14T12:00:00');
		const r = formatMessageTime('2026-06-14T09:30:00', { now, locale: 'en-US' });
		expect(r).toMatch(/\d{1,2}:\d{2}/);
		expect(r).not.toMatch(MONTHS);
	});

	it('formats a different-day timestamp with a short month and time', () => {
		const now = new Date('2026-06-14T12:00:00');
		const r = formatMessageTime('2026-01-05T09:30:00', { now, locale: 'en-US' });
		expect(r).toMatch(MONTHS);
		expect(r).toMatch(/\d{1,2}:\d{2}/);
	});

	it('uses the real current time as the default boundary', () => {
		// No `now` passed: a far-past date must always fall into the dated (month) branch.
		expect(formatMessageTime('2000-01-01T00:00:00', { locale: 'en-US' })).toMatch(MONTHS);
	});
});
