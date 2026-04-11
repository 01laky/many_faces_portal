/**
 * Guards the **hard reset** helper used when refresh fails or user logs out: both auth and capability
 * caches must disappear so the UI cannot flash privileged routes with stale `meCapabilities` data.
 */
import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { clearAuthAndCapabilitiesQueries, authKeys } from '../useAuthApi';
import { meCapabilitiesKeys } from '../useMeCapabilities';

describe('clearAuthAndCapabilitiesQueries', () => {
  it('removes auth and meCapabilities queries (refresh failure / security §18)', () => {
    const qc = new QueryClient();
    qc.setQueryData(authKeys.user(), { id: '1' });
    qc.setQueryData(meCapabilitiesKeys.session('fp'), { permissions: [] });

    clearAuthAndCapabilitiesQueries(qc);

    expect(qc.getQueryData(authKeys.user())).toBeUndefined();
    expect(qc.getQueryData(meCapabilitiesKeys.session('fp'))).toBeUndefined();
  });
});
