/**
 * Profile API — account-wide routes at `/api/profile/...` (never `/{face}/api/profile/...`).
 *
 * Uses a dedicated axios instance so the global face-prefix and 401 interceptors on the default
 * axios client cannot rewrite URLs or clear the session when saving settings.
 */

import axios from 'axios';
import { env } from '../../config/env';
import { getAxiosApiErrorMessage } from '../../utils/apiErrorMessage';
import type { SupportedLanguage } from '../../i18n/constants';

export interface ProfileMe {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  enableAnimatedGradient: boolean;
  preferredUiLanguage: SupportedLanguage | null;
  lastSelectedFaceId: number | null;
  globalAvatarUrl: string | null;
  faceAvatarUrl: string | null;
}

export interface GridComponentPreferences {
  autoplay?: boolean;
}

export interface FaceGridSettingsResponse {
  gridComponents: Record<string, GridComponentPreferences>;
}

/** Isolated client: no face-prefix request interceptor, no global 401 logout interceptor. */
const profileHttp = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function profileMeUrl(faceId?: number | null): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return faceId != null ? `${base}/api/profile/me?faceId=${faceId}` : `${base}/api/profile/me`;
}

export async function getProfile(
  token: string | null,
  faceId?: number | null
): Promise<ProfileMe> {
  const res = await profileHttp.get<ProfileMe>(profileMeUrl(faceId), {
    headers: authHeaders(token),
  });
  return {
    ...res.data,
    enableAnimatedGradient: res.data.enableAnimatedGradient ?? false,
    preferredUiLanguage: res.data.preferredUiLanguage ?? null,
    lastSelectedFaceId: res.data.lastSelectedFaceId ?? null,
  };
}

export async function updateProfile(
  token: string | null,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    enableAnimatedGradient?: boolean;
    preferredUiLanguage?: SupportedLanguage | null;
    lastSelectedFaceId?: number | null;
    clearPreferredUiLanguage?: boolean;
    clearLastSelectedFaceId?: boolean;
  }
): Promise<void> {
  if (!token) {
    throw new Error('Not authenticated');
  }
  try {
    await profileHttp.put(
      `${env.apiUrl.replace(/\/$/, '')}/api/profile/me`,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        enableAnimatedGradient: data.enableAnimatedGradient,
        preferredUiLanguage: data.preferredUiLanguage,
        lastSelectedFaceId: data.lastSelectedFaceId,
        clearPreferredUiLanguage: data.clearPreferredUiLanguage,
        clearLastSelectedFaceId: data.clearLastSelectedFaceId,
      },
      { headers: authHeaders(token) }
    );
  } catch (error) {
    const message = getAxiosApiErrorMessage(error, 'Profile update failed');
    throw new Error(message, { cause: error });
  }
}

export async function getFaceGridSettings(
  token: string | null,
  faceId: number
): Promise<FaceGridSettingsResponse> {
  if (!token) throw new Error('Not authenticated');
  const base = env.apiUrl.replace(/\/$/, '');
  const res = await profileHttp.get<FaceGridSettingsResponse>(
    `${base}/api/profile/me/faces/${faceId}/settings`,
    { headers: authHeaders(token) }
  );
  return { gridComponents: res.data.gridComponents ?? {} };
}

export async function updateFaceGridSettings(
  token: string | null,
  faceId: number,
  data: FaceGridSettingsResponse
): Promise<FaceGridSettingsResponse> {
  if (!token) throw new Error('Not authenticated');
  const base = env.apiUrl.replace(/\/$/, '');
  try {
    const res = await profileHttp.put<FaceGridSettingsResponse>(
      `${base}/api/profile/me/faces/${faceId}/settings`,
      data,
      { headers: authHeaders(token) }
    );
    return { gridComponents: res.data.gridComponents ?? {} };
  } catch (error) {
    const message = getAxiosApiErrorMessage(error, 'Grid settings update failed');
    throw new Error(message, { cause: error });
  }
}

export async function uploadGlobalAvatar(
  token: string | null,
  file: File
): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const base = env.apiUrl.replace(/\/$/, '');
  const res = await profileHttp.post<{ avatarUrl: string }>(
    `${base}/api/profile/me/avatar`,
    form,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    }
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
  const base = env.apiUrl.replace(/\/$/, '');
  const res = await profileHttp.post<{ avatarUrl: string }>(
    `${base}/api/profile/me/faces/${faceId}/avatar`,
    form,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}
