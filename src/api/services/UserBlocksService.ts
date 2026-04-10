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

export interface BlockedUserItem {
  id: number;
  blockedId: string;
  blockedEmail: string | null;
  blockedName: string;
  createdAt: string;
}

export async function getBlockedUsers(token: string): Promise<BlockedUserItem[]> {
  const res = await apiFetch('/api/UserBlocks', { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch blocked users');
  return res.json();
}

export async function getBlockStatus(
  userId: string,
  token: string,
): Promise<{ isBlocked: boolean }> {
  const res = await apiFetch(`/api/UserBlocks/status/${userId}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to check block status');
  return res.json();
}

export async function blockUser(blockedId: string, token: string): Promise<void> {
  const res = await apiFetch('/api/UserBlocks', {
    method: 'POST',
    token,
    body: JSON.stringify({ blockedId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to block user');
  }
}

export async function unblockUser(userId: string, token: string): Promise<void> {
  const res = await apiFetch(`/api/UserBlocks/${userId}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to unblock user');
}
