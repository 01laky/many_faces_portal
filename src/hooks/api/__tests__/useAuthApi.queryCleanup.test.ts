/**
 * Guards the **hard reset** helper used when refresh fails or user logs out: both auth and capability
 * caches must disappear so the UI cannot flash privileged routes with stale `meCapabilities` data.
 */
import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { clearAuthAndCapabilitiesQueries, authKeys } from '@/hooks/api/useAuthApi';
import { meCapabilitiesKeys } from '@/hooks/api/useMeCapabilities';

describe('clearAuthAndCapabilitiesQueries', () => {
	it('removes auth and meCapabilities queries (refresh failure / security §18)', () => {
		const qc = new QueryClient();
		qc.setQueryData(authKeys.user(), { id: '1' });
		qc.setQueryData(meCapabilitiesKeys.session('fp'), { permissions: [] });

		clearAuthAndCapabilitiesQueries(qc);

		expect(qc.getQueryData(authKeys.user())).toBeUndefined();
		expect(qc.getQueryData(meCapabilitiesKeys.session('fp'))).toBeUndefined();
	});

	it('purges per-user / per-face domain caches on logout (REQ-SECURITY-CACHE, no cross-session leak)', () => {
		// Regression: these roots are not token-fingerprinted, so without an explicit removeQueries the
		// previous user's grid/profile/submission data survived into the next session's cache.
		const domainRoots = [
			['face', 1, 'albums'],
			['profile'],
			['profile', 1],
			['myContentSubmissions'],
			['wall', 1],
			['videoLoungeLive', 1],
			['facesConfig', 'fp'],
		];
		const qc = new QueryClient();
		for (const key of domainRoots) {
			qc.setQueryData(key, { leaked: true });
		}

		clearAuthAndCapabilitiesQueries(qc);

		for (const key of domainRoots) {
			expect(qc.getQueryData(key)).toBeUndefined();
		}
	});

	it('removes deeply-nested subkeys under each domain root (partial-match removal)', () => {
		const qc = new QueryClient();
		qc.setQueryData(['face', 7, 'albums', 'page', 2], { a: 1 });
		qc.setQueryData(['face', 7, 'userProfiles', { sort: 'recent' }], { b: 2 });
		qc.setQueryData(['wall', 7, 'detail', 99], { c: 3 });

		clearAuthAndCapabilitiesQueries(qc);

		expect(qc.getQueryData(['face', 7, 'albums', 'page', 2])).toBeUndefined();
		expect(qc.getQueryData(['face', 7, 'userProfiles', { sort: 'recent' }])).toBeUndefined();
		expect(qc.getQueryData(['wall', 7, 'detail', 99])).toBeUndefined();
	});

	it('does not remove unrelated (non-domain) cache entries', () => {
		const qc = new QueryClient();
		qc.setQueryData(['somethingElse'], { keep: true });
		qc.setQueryData(['faceLabels', 1], { keep: true }); // different root, not a prefix of ['face']
		qc.setQueryData(['profileTheme'], { keep: true }); // not ['profile']

		clearAuthAndCapabilitiesQueries(qc);

		expect(qc.getQueryData(['somethingElse'])).toEqual({ keep: true });
		expect(qc.getQueryData(['faceLabels', 1])).toEqual({ keep: true });
		expect(qc.getQueryData(['profileTheme'])).toEqual({ keep: true });
	});

	it('is idempotent and safe on an empty cache', () => {
		const qc = new QueryClient();
		expect(() => {
			clearAuthAndCapabilitiesQueries(qc);
			clearAuthAndCapabilitiesQueries(qc);
		}).not.toThrow();

		qc.setQueryData(['profile'], { x: 1 });
		clearAuthAndCapabilitiesQueries(qc);
		clearAuthAndCapabilitiesQueries(qc);
		expect(qc.getQueryData(['profile'])).toBeUndefined();
	});
});
