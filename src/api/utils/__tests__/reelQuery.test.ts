import { describe, it, expect } from 'vitest';
import { buildFaceQuery } from '../reelQuery';

describe('buildFaceQuery', () => {
	it('returns empty string when faceId is undefined', () => {
		expect(buildFaceQuery(undefined)).toBe('');
	});

	it('appends faceId query when provided', () => {
		expect(buildFaceQuery(3)).toBe('?faceId=3');
	});
});
