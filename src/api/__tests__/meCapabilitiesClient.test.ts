import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/env', () => ({
  env: { apiUrl: 'http://api.test', defaultFacePrefix: 'public' },
}));

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));

import axios from 'axios';
import { fetchMeCapabilities } from '../meCapabilitiesClient';

describe('fetchMeCapabilities', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
  });

  it('GETs /api/me/capabilities with Bearer token', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        globalRole: 'USER',
        requestFaceId: 1,
        requestFaceIndex: 'public',
        isAdminFaceScope: false,
        myFaceRoleName: null,
        permissions: ['tenant:session'],
      },
    });
    const result = await fetchMeCapabilities('secret-token');
    expect(axios.get).toHaveBeenCalledWith('http://api.test/api/me/capabilities', {
      headers: { Authorization: 'Bearer secret-token' },
    });
    expect(result?.globalRole).toBe('USER');
    expect(result?.permissions).toContain('tenant:session');
  });

  it('returns null when JSON fails parseMeCapabilities', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { globalRole: 1 } });
    await expect(fetchMeCapabilities('t')).resolves.toBeNull();
  });

  it('propagates axios errors', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('network'));
    await expect(fetchMeCapabilities('t')).rejects.toThrow('network');
  });
});
