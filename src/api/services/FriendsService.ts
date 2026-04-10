import { authAwareFetch } from '../utils/authAwareFetch';
import { absoluteScopedUrl } from '../faceApiRouting';

async function apiFetch(path: string, options: RequestInit & { token?: string }) {
  const token = options.token;
  delete (options as Record<string, unknown>).token;
  const url = absoluteScopedUrl(path);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return authAwareFetch(url, { ...options, headers, token: token ?? undefined });
}

export interface FriendItem {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export async function getFriends(token: string): Promise<FriendItem[]> {
  const res = await apiFetch('/api/Friends', { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch friends');
  return res.json();
}
