/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createFacesConfigQueryOptions, facesConfigKeys } from '@/hooks/api/useFacesConfigQuery';
import { createMeCapabilitiesQueryOptions } from '@/hooks/api/useMeCapabilities';
import { profileQueryKey } from '@/hooks/api/useProfileApi';

vi.mock('@/api/config/getFacesConfig', () => ({
	getFacesConfig: vi.fn(async () => [{ id: 1, index: 'demo', isPublic: true }]),
}));

vi.mock('@/api/meCapabilitiesClient', () => ({
	fetchMeCapabilities: vi.fn(async () => ({
		globalRole: 'user',
		requestFaceId: 1,
		requestFaceIndex: 'demo',
		isAdminFaceScope: false,
		myFaceRoleName: 'FACE_MEMBER',
		permissions: ['face.member'],
	})),
}));

vi.mock('@/api/profile/profileApi', () => ({
	getProfile: vi.fn(async () => ({ id: 'u1', lastSelectedFaceId: 1 })),
}));

describe('bootstrap Query keys (PT-RP5 / PT-RP22)', () => {
	let client: QueryClient;

	beforeEach(() => {
		client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		vi.clearAllMocks();
	});

	it('PT-RP5-U1: profile query key is stable for dedup', () => {
		expect(profileQueryKey()).toEqual(['profile']);
		expect(profileQueryKey()).toEqual(profileQueryKey());
	});

	it('PT-RP5-U2: logout removes profile from cache', () => {
		client.setQueryData(profileQueryKey(), { id: 'u1' });
		client.removeQueries({ queryKey: profileQueryKey() });
		expect(client.getQueryData(profileQueryKey())).toBeUndefined();
	});

	it('PT-RP22-U1: faces config fetch once per session key', async () => {
		const { getFacesConfig } = await import('@/api/config/getFacesConfig');
		const opts = createFacesConfigQueryOptions('long-token-value-here');
		await client.fetchQuery(opts);
		await client.fetchQuery(opts);
		expect(getFacesConfig).toHaveBeenCalledTimes(1);
	});

	it('PT-RP22-U3: invalidate faces config marks stale', async () => {
		const opts = createFacesConfigQueryOptions('token-abc');
		await client.fetchQuery(opts);
		const key = facesConfigKeys.session(opts.queryKey[1] as string);
		await client.invalidateQueries({ queryKey: key });
		expect(client.getQueryState(key)?.isInvalidated).toBe(true);
	});

	it('PT-RP28-U1: capabilities share session key shape', () => {
		const caps = createMeCapabilitiesQueryOptions('token-abc', true);
		expect(caps.queryKey[0]).toBe('meCapabilities');
		expect(caps.enabled).toBe(true);
	});

	it('PT-RP5-U3: profile face-scoped key differs from global', () => {
		expect(profileQueryKey(7)).not.toEqual(profileQueryKey());
	});
});
