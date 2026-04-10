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

export interface FollowUserItem {
  id: number;
  userId: string;
  email: string | null;
  name: string;
  createdAt: string;
}

export async function getFollowing(token: string): Promise<FollowUserItem[]> {
  const res = await apiFetch('/api/UserFollows/following', { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch following');
  return res.json();
}

export async function getFollowers(token: string): Promise<FollowUserItem[]> {
  const res = await apiFetch('/api/UserFollows/followers', { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch followers');
  return res.json();
}

export async function getFollowStatus(
  userId: string,
  token: string,
): Promise<{ isFollowing: boolean }> {
  const res = await apiFetch(`/api/UserFollows/status/${userId}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to check follow status');
  return res.json();
}

export async function followUser(followedId: string, token: string): Promise<void> {
  const res = await apiFetch('/api/UserFollows', {
    method: 'POST',
    token,
    body: JSON.stringify({ followedId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to follow user');
  }
}

export async function unfollowUser(userId: string, token: string): Promise<void> {
  const res = await apiFetch(`/api/UserFollows/${userId}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to unfollow user');
}
