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

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export async function getNotifications(token: string, limit = 50): Promise<NotificationItem[]> {
  const res = await apiFetch(`/api/Notifications?limit=${limit}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}
