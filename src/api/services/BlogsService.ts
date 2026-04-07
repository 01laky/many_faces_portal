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

export interface BlogImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface BlogItem {
  id: number;
  title: string;
  content: string;
  faceId: number;
  faceTitle: string;
  creatorId: string;
  creatorName: string;
  images: BlogImage[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface BlogComment {
  id: number;
  blogId: number;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface BlogLike {
  id: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  faceId: number;
  imageUrls?: string[];
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  faceId?: number;
  imageUrls?: string[];
}

// ── Blogs CRUD ──

export async function getBlogs(token: string, faceId?: number): Promise<BlogItem[]> {
  const query = faceId ? `?faceId=${faceId}` : '';
  const res = await apiFetch(`/api/Blogs${query}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch blogs');
  return res.json();
}

export async function getBlog(id: number, token: string): Promise<BlogItem> {
  const res = await apiFetch(`/api/Blogs/${id}`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch blog');
  return res.json();
}

export async function createBlog(dto: CreateBlogDto, token: string): Promise<BlogItem> {
  const res = await apiFetch('/api/Blogs', {
    method: 'POST',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to create blog');
  }
  return res.json();
}

export async function updateBlog(
  id: number,
  dto: UpdateBlogDto,
  token: string,
): Promise<BlogItem> {
  const res = await apiFetch(`/api/Blogs/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to update blog');
  }
  return res.json();
}

export async function deleteBlog(id: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Blogs/${id}`, { method: 'DELETE', token });
  if (!res.ok) throw new Error('Failed to delete blog');
}

// ── Comments ──

export async function getBlogComments(blogId: number, token: string): Promise<BlogComment[]> {
  const res = await apiFetch(`/api/Blogs/${blogId}/comments`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function createBlogComment(
  blogId: number,
  content: string,
  token: string,
): Promise<BlogComment> {
  const res = await apiFetch(`/api/Blogs/${blogId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function deleteBlogComment(
  blogId: number,
  commentId: number,
  token: string,
): Promise<void> {
  const res = await apiFetch(`/api/Blogs/${blogId}/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

// ── Likes ──

export async function likeBlog(blogId: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Blogs/${blogId}/likes`, { method: 'POST', token });
  if (!res.ok) throw new Error('Failed to like blog');
}

export async function unlikeBlog(blogId: number, token: string): Promise<void> {
  const res = await apiFetch(`/api/Blogs/${blogId}/likes`, { method: 'DELETE', token });
  if (!res.ok) throw new Error('Failed to unlike blog');
}

export async function getBlogLikes(blogId: number, token: string): Promise<BlogLike[]> {
  const res = await apiFetch(`/api/Blogs/${blogId}/likes`, { method: 'GET', token });
  if (!res.ok) throw new Error('Failed to fetch likes');
  return res.json();
}
