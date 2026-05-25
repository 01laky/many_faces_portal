import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import * as meClient from '../../../api/meCapabilitiesClient';
import {
	createMeCapabilitiesQueryOptions,
	meCapabilitiesKeys,
	meCapabilitiesTokenFingerprint,
} from '../useMeCapabilities';

vi.mock('../../../api/meCapabilitiesClient');

describe('meCapabilitiesTokenFingerprint', () => {
	it('uses short token as-is', () => {
		expect(meCapabilitiesTokenFingerprint('abc')).toBe('abc');
		expect(meCapabilitiesTokenFingerprint(null)).toBe('');
	});

	it('truncates long tokens for stable query keys', () => {
		const long = 'a'.repeat(40);
		expect(meCapabilitiesTokenFingerprint(long)).toBe(`${'a'.repeat(12)}...${'a'.repeat(8)}`);
	});
});

describe('createMeCapabilitiesQueryOptions + React Query', () => {
	beforeEach(() => vi.mocked(meClient.fetchMeCapabilities).mockReset());

	it('fetchQuery runs queryFn when enabled and token set', async () => {
		vi.mocked(meClient.fetchMeCapabilities).mockResolvedValue({
			globalRole: 'USER',
			requestFaceId: 1,
			requestFaceIndex: 'public',
			isAdminFaceScope: false,
			myFaceRoleName: null,
			permissions: ['tenant:session'],
		});
		const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const opts = createMeCapabilitiesQueryOptions('my-jwt', true);
		const data = await qc.fetchQuery(opts);
		expect(meClient.fetchMeCapabilities).toHaveBeenCalledWith('my-jwt');
		expect(data?.permissions).toContain('tenant:session');
	});

	it('marks query disabled when enabled flag is false', () => {
		const opts = createMeCapabilitiesQueryOptions('x', false);
		expect(opts.enabled).toBe(false);
	});

	it('marks query disabled when token is missing', () => {
		const opts = createMeCapabilitiesQueryOptions(null, true);
		expect(opts.enabled).toBe(false);
	});
});

describe('meCapabilitiesKeys', () => {
	it('uses a fixed root segment', () => {
		expect(meCapabilitiesKeys.all).toEqual(['meCapabilities']);
	});

	it('session key includes fingerprint for cache isolation', () => {
		expect(meCapabilitiesKeys.session('fp1')).toEqual(['meCapabilities', 'fp1']);
		expect(meCapabilitiesKeys.session('fp1')).not.toEqual(meCapabilitiesKeys.session('fp2'));
	});
});
