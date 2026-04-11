/**
 * Axios-level tests for `profileApi.ts` — verifies URLs/verbs/headers against mocked `axios` without
 * hitting the network. `env.apiUrl` is stubbed so tests stay independent of developer `.env.local`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../config/env', () => ({
  env: { apiUrl: 'http://api.test' },
}));

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
}));

vi.mock('axios', () => ({
  default: axiosMock,
}));

import axios from 'axios';
import {
  getProfile,
  updateProfile,
  uploadGlobalAvatar,
  uploadFaceAvatar,
} from '../profileApi';

describe('profileApi', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
    vi.mocked(axios.put).mockReset();
    vi.mocked(axios.post).mockReset();
  });

  it('getProfile GETs /api/profile/me with optional faceId', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { firstName: null, lastName: null, email: null, globalAvatarUrl: null, faceAvatarUrl: null } });
    await getProfile('tok', null);
    expect(axios.get).toHaveBeenCalledWith('http://api.test/api/profile/me', {
      headers: { Authorization: 'Bearer tok' },
    });
    await getProfile('tok', 5);
    expect(axios.get).toHaveBeenCalledWith('http://api.test/api/profile/me?faceId=5', {
      headers: { Authorization: 'Bearer tok' },
    });
  });

  it('updateProfile PUTs JSON body', async () => {
    vi.mocked(axios.put).mockResolvedValue(undefined);
    await updateProfile('tok', { firstName: 'A' });
    expect(axios.put).toHaveBeenCalledWith(
      'http://api.test/api/profile/me',
      { firstName: 'A' },
      { headers: { Authorization: 'Bearer tok' } }
    );
  });

  it('uploadGlobalAvatar POSTs multipart', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { avatarUrl: '/a.png' } });
    const file = new File(['x'], 'p.png', { type: 'image/png' });
    const out = await uploadGlobalAvatar('tok', file);
    expect(out).toEqual({ avatarUrl: '/a.png' });
    const [url, form, init] = vi.mocked(axios.post).mock.calls[0] as [
      string,
      FormData,
      { headers: Record<string, string> },
    ];
    expect(url).toBe('http://api.test/api/profile/me/avatar');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.headers['Content-Type']).toBe('multipart/form-data');
    expect(form.get('file')).toBe(file);
  });

  it('uploadFaceAvatar POSTs to face-scoped path', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { avatarUrl: '/f.png' } });
    const file = new File(['y'], 'f.png', { type: 'image/png' });
    await uploadFaceAvatar('tok', 9, file);
    const [url] = vi.mocked(axios.post).mock.calls[0] as [string, FormData, unknown];
    expect(url).toBe('http://api.test/api/profile/me/faces/9/avatar');
  });
});
