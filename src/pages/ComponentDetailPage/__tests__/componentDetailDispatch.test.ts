import { describe, it, expect } from 'vitest';
import { resolveComponentDetailDispatch } from '@/pages/ComponentDetailPage/componentDetailDispatch';

describe('componentDetailDispatch (PT-RP6)', () => {
	it('PT-RP6-U1: type 4 resolves chatRoom', () => {
		expect(resolveComponentDetailDispatch(4, 99)).toBe('chatRoom');
	});

	it('PT-RP6-U1b: type 8 resolves videoLounge not chatRoom', () => {
		expect(resolveComponentDetailDispatch(8, 1)).toBe('videoLounge');
		expect(resolveComponentDetailDispatch(4, 1)).not.toBe('videoLounge');
	});

	it('PT-RP6-U2: invalid numeric params', () => {
		expect(resolveComponentDetailDispatch(Number.NaN, 1)).toBe('invalid');
		expect(resolveComponentDetailDispatch(4, Number.NaN)).toBe('invalid');
	});

	it('PT-RP6-U2b: unsupported types return unsupported', () => {
		expect(resolveComponentDetailDispatch(2, 10)).toBe('unsupported');
		expect(resolveComponentDetailDispatch(99, 1)).toBe('unsupported');
	});
});
