import { env } from '../../config/env';
import { authAwareFetch } from '../utils/authAwareFetch';

async function apiFetch(path: string, options: RequestInit & { token?: string }) {
  const token = options.token;
  delete (options as Record<string, unknown>).token;
  const url = `${env.apiUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return authAwareFetch(url, { ...options, headers, token: token ?? undefined });
}

export interface AlbumItem {
  id: number;
  title: string;
  description: string | null;
  albumType: number;
  mediaType: number;
  creatorId: string;
  creatorName: string;
  faces: { faceId: number; title: string }[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AlbumComment {
  id: number;
  albumId: number;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AlbumLike {
  id: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CreateAlbumDto {
  title: string;
  description?: string;
  albumType: number;
  mediaType: number;
  faceIds?: number[];
}

export interface UpdateAlbumDto {
  title?: string;
  description?: string;
  albumType?: number;
  mediaType?: number;
  faceIds?: number[];
}

// ── Albums CRUD ──

export async function getAlbums(token: string, faceId?: number): Promise<AlbumItem[]> {
  const q = faceId != null ? `?faceId=${encodeURIComponent(String(faceId))}` : '';
  const res = await apiFetch(`/api/Albums${q}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch albums');
  return res.json();
}

export async function getAlbum(id: number, token: string): Promise<AlbumItem> {
  const res = await apiFetch(`/api/Albums/${id}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch album');
  return res.json();
}

export async function getAlbumsByUser(userId: string, token: string): Promise<AlbumItem[]> {
  const res = await apiFetch(`/api/Albums/user/${userId}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch user albums');
  return res.json();
}

export async function createAlbum(dto: CreateAlbumDto, token: string): Promise<AlbumItem> {
  const res = await apiFetch('/api/Albums', {
    method: 'POST',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to create album');
  }
  return res.json();
}

export async function updateAlbum(
  id: number,
  dto: UpdateAlbumDto,
  token: string,
): Promise<AlbumItem> {
  const res = await apiFetch(`/api/Albums/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to update album');
  }
  return res.json();
}

export async function deleteAlbum(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Albums/${id}`, { method: 'DELETE', token });
  if (!res.ok) throw new Error('Failed to delete album');
}

// ── Comments ──

export async function getAlbumComments(albumId: number, token: string): Promise<AlbumComment[]> {
  const res = await apiFetch(`/api/Albums/${albumId}/comments`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function createAlbumComment(
  albumId: number,
  content: string,
  token: string,
): Promise<AlbumComment> {
  const res = await apiFetch(`/api/Albums/${albumId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function deleteAlbumComment(
  albumId: number,
  commentId: number,
  token: string,
): Promise<void> {
  const res = await apiFetch(`/api/Albums/${albumId}/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

// ── Likes ──

export async function likeAlbum(albumId: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Albums/${albumId}/likes`, { method: 'POST', token });
  if (!res.ok) throw new Error('Failed to like album');
}

export async function unlikeAlbum(albumId: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Albums/${albumId}/likes`, { method: 'DELETE', token });
  if (!res.ok) throw new Error('Failed to unlike album');
}

export async function getAlbumLikes(albumId: number, token: string): Promise<AlbumLike[]> {
  const res = await apiFetch(`/api/Albums/${albumId}/likes`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch likes');
  return res.json();
}
