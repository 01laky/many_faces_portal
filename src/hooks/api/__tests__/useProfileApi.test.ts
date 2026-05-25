/**
 * Contract tests for React Query key shape used by `useProfile` — ensures face-scoped vs global profile
 * caches invalidate independently (`['profile']` vs `['profile', faceId]`).
 */
import { describe, it, expect } from 'vitest';
import { profileQueryKey } from '../useProfileApi';

describe('profileQueryKey', () => {
	it('uses a single segment when faceId is null or undefined', () => {
		expect(profileQueryKey(null)).toEqual(['profile']);
		expect(profileQueryKey(undefined)).toEqual(['profile']);
	});

	it('includes face id when set', () => {
		expect(profileQueryKey(42)).toEqual(['profile', 42]);
	});
});
