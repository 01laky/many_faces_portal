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

export interface FriendRequestItem {
  id: number;
  senderId: string;
  senderEmail: string | null;
  senderName: string;
  createdAt: string;
}

export async function getPendingFriendRequests(token: string): Promise<FriendRequestItem[]> {
  const res = await apiFetch('/api/FriendRequests', { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch friend requests');
  return res.json();
}

export async function sendFriendRequest(receiverId: string, token: string): Promise<void> {
  const res = await apiFetch('/api/FriendRequests', {
    method: 'POST',
    token,
    body: JSON.stringify({ receiverId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to send friend request');
  }
}

export async function acceptFriendRequest(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/FriendRequests/${id}/accept`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error('Failed to accept');
}

export async function rejectFriendRequest(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/FriendRequests/${id}/reject`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error('Failed to reject');
}
