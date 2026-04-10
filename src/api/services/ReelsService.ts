import { authAwareFetch } from '../utils/authAwareFetch';
import { buildFaceQuery } from '../utils/reelQuery';
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

export interface ReelItem {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  creatorId: string;
  creatorName: string;
  faces: { faceId: number; title: string }[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReelComment {
  id: number;
  reelId: number;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReelLike {
  id: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CreateReelDto {
  title: string;
  description?: string;
  videoUrl: string;
  faceIds?: number[];
}

export interface UpdateReelDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  faceIds?: number[];
}

export async function getReels(token: string, faceId?: number): Promise<ReelItem[]> {
  const res = await apiFetch(`/api/Reels${buildFaceQuery(faceId)}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch reels');
  return res.json();
}

export async function getReel(id: number, token: string, faceId?: number): Promise<ReelItem> {
  const res = await apiFetch(`/api/Reels/${id}${buildFaceQuery(faceId)}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch reel');
  return res.json();
}

export async function getReelsByUser(
  userId: string,
  token: string,
  faceId?: number,
): Promise<ReelItem[]> {
  const res = await apiFetch(`/api/Reels/user/${userId}${buildFaceQuery(faceId)}`, {
    method: 'GET',
    token,
  });
  if (!res.ok) throw new Error('Failed to fetch user reels');
  return res.json();
}

export async function createReel(dto: CreateReelDto, token: string): Promise<ReelItem> {
  const res = await apiFetch('/api/Reels', {
    method: 'POST',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to create reel');
  }
  return res.json();
}

export async function updateReel(
  id: number,
  dto: UpdateReelDto,
  token: string,
): Promise<ReelItem> {
  const res = await apiFetch(`/api/Reels/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to update reel');
  }
  return res.json();
}

export async function deleteReel(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Reels/${id}`, { method: 'DELETE', token });
  if (!res.ok) throw new Error('Failed to delete reel');
}

export async function getReelComments(
  reelId: number,
  token: string,
  faceId?: number,
): Promise<ReelComment[]> {
  const res = await apiFetch(`/api/Reels/${reelId}/comments${buildFaceQuery(faceId)}`, {
    method: 'GET',
    token,
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function createReelComment(
  reelId: number,
  content: string,
  token: string,
  faceId?: number,
): Promise<ReelComment> {
  const res = await apiFetch(`/api/Reels/${reelId}/comments${buildFaceQuery(faceId)}`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function deleteReelComment(
  reelId: number,
  commentId: number,
  token: string,
): Promise<void> {
  const res = await apiFetch(`/api/Reels/${reelId}/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

export async function likeReel(reelId: number, token: string, faceId?: number): Promise<void> {
  const res = await apiFetch(`/api/Reels/${reelId}/likes${buildFaceQuery(faceId)}`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error('Failed to like reel');
}

export async function unlikeReel(reelId: number, token: string, faceId?: number): Promise<void> {
  const res = await apiFetch(`/api/Reels/${reelId}/likes${buildFaceQuery(faceId)}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to unlike reel');
}
