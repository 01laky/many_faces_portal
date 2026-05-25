import { describe, it, expect } from 'vitest';
import {
	formatContentDate,
	formatContentValue,
	mutationErrorMessage,
} from '../contentDetailFormat';
import { formatMessageTime } from '../formatMessageTime';

describe('contentDetailFormat REF-T', () => {
	it('REF-T1: formatContentDate invalid → em dash', () => {
		expect(formatContentDate('not-a-date')).toBe('—');
		expect(formatContentDate(null)).toBe('—');
	});

	it('REF-T2: valid ISO formatted', () => {
		const out = formatContentDate('2024-06-15T12:00:00.000Z');
		expect(out).not.toBe('—');
		expect(out.length).toBeGreaterThan(0);
	});

	it('REF-T4: null/undefined safe for formatContentValue', () => {
		expect(formatContentValue(null)).toBe('—');
		expect(formatContentValue(undefined)).toBe('—');
	});

	it('REF-T6: mutationErrorMessage parity with admin helper', () => {
		expect(mutationErrorMessage(new Error('boom'))).toBe('boom');
		expect(mutationErrorMessage('  network  ')).toBe('network');
		expect(mutationErrorMessage(new Error(''))).toBe('Request failed');
		expect(mutationErrorMessage({ code: 500 })).toBe('Request failed');
	});
});

describe('formatMessageTime REF-T', () => {
	it('REF-T3: today vs yesterday boundary with fixed clock', () => {
		const now = new Date('2024-03-20T15:00:00.000Z');
		const todayIso = '2024-03-20T10:30:00.000Z';
		const yesterdayIso = '2024-03-19T10:30:00.000Z';
		const todayOut = formatMessageTime(todayIso, { now, locale: 'en-US' });
		const yesterdayOut = formatMessageTime(yesterdayIso, { now, locale: 'en-US' });
		expect(todayOut).toMatch(/\d/);
		expect(yesterdayOut).toMatch(/Mar|19|\d/);
		expect(todayOut).not.toEqual(yesterdayOut);
	});

	it('REF-T4: null/undefined safe', () => {
		expect(formatMessageTime(null)).toBe('');
		expect(formatMessageTime(undefined)).toBe('');
	});

	it('REF-T5: timezone stable UTC input', () => {
		const out = formatMessageTime('2024-01-01T00:00:00.000Z', {
			now: new Date('2024-01-02T00:00:00.000Z'),
			locale: 'en-US',
		});
		expect(out.length).toBeGreaterThan(0);
	});
});
