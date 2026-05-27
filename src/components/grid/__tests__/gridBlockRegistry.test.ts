import { describe, it, expect, beforeEach } from 'vitest';
import {
	getLazyGridBlock,
	isKnownGridComponentType,
	resetGridBlockRegistryForTests,
} from '@/components/grid/gridBlockRegistry';

describe('gridBlockRegistry (PT-RP1)', () => {
	beforeEach(() => {
		resetGridBlockRegistryForTests();
	});

	it('PT-RP1-U1: album-only schema resolves album lazy block', () => {
		expect(isKnownGridComponentType('albumGrid')).toBe(true);
		const Lazy = getLazyGridBlock('albumGrid');
		expect(Lazy).toBeDefined();
	});

	it('PT-RP1-U2: unknown component type is not known', () => {
		expect(isKnownGridComponentType('notARealGrid')).toBe(false);
	});

	it('PT-RP1-U3: two types produce distinct lazy components', () => {
		const a = getLazyGridBlock('albumGrid');
		const b = getLazyGridBlock('blogGrid');
		expect(a).not.toBe(b);
	});

	it('PT-RP1-U4: lazy cache returns same reference for repeated type', () => {
		const first = getLazyGridBlock('storyGrid');
		const second = getLazyGridBlock('storyGrid');
		expect(first).toBe(second);
	});

	it('PT-RP1-U5: reset clears lazy cache', () => {
		const first = getLazyGridBlock('reelGrid');
		resetGridBlockRegistryForTests();
		const second = getLazyGridBlock('reelGrid');
		expect(first).not.toBe(second);
	});
});
