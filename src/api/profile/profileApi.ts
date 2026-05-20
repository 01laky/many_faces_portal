/**
 * Profile API - current user profile and avatar uploads.
 *
 * Uses direct axios calls with token so the ApiClient face-path interceptor
 * does not rewrite profile URLs (backend profile routes are /api/profile/..., not face-prefixed).
 */

import axios from 'axios';
import { env } from '../../config/env';

export interface ProfileMe {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  enableAnimatedGradient: boolean;
  globalAvatarUrl: string | null;
  faceAvatarUrl: string | null;
}

function headers(token: string | null) {
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function getProfile(
  token: string | null,
  faceId?: number | null
): Promise<ProfileMe> {
  const base = env.apiUrl;
  const url = faceId != null ? `${base}/api/profile/me?faceId=${faceId}` : `${base}/api/profile/me`;
  const res = await axios.get<ProfileMe>(url, { headers: headers(token) });
  return {
    ...res.data,
    enableAnimatedGradient: res.data.enableAnimatedGradient ?? false,
  };
}

export async function updateProfile(
  token: string | null,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    enableAnimatedGradient?: boolean;
  },
): Promise<void> {
  await axios.put(`${env.apiUrl}/api/profile/me`, data, { headers: headers(token) });
}

export async function uploadGlobalAvatar(
  token: string | null,
  file: File
): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post<{ avatarUrl: string }>(
    `${env.apiUrl}/api/profile/me/avatar`,
    form,
    { headers: { ...headers(token), 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}

export async function uploadFaceAvatar(
  token: string | null,
  faceId: number,
  file: File
): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post<{ avatarUrl: string }>(
    `${env.apiUrl}/api/profile/me/faces/${faceId}/avatar`,
    form,
    { headers: { ...headers(token), 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}
