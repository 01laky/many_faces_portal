import axios from 'axios';
import { env } from '../../config/env';

export interface StoryListItem {
  id: number;
  title: string;
  creatorId: string;
  creatorName: string;
  imageCount: number;
  coverUrl: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface StoryMineRow {
  id: number;
  title: string;
  state: string;
  publishedAt: string | null;
  expiresAt: string | null;
  scheduledPublishAt: string | null;
  createdAt: string;
  imageCount: number;
  faceIds: number[];
}

export function storiesListRelativePath(faceIndex: string): string {
  return `/${faceIndex}/stories`;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/** Absolute URL for story image paths returned as `/uploads/...`. */
export function resolveApiMediaUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = env.apiUrl.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export type StoryDetailImageRow = {
  id: number;
  imageUrl: string;
  description: string | null;
  sortOrder: number;
};

type StoryDetailDto = {
  images: StoryDetailImageRow[];
};

const storySlideshowUrlsCache = new Map<number, string[]>();

/**
 * Ordered absolute image URLs for a story (cached). Used for hover slideshow in grid/carousel.
 */
export async function fetchStorySlideshowImageUrls(
  token: string,
  storyId: number,
  faceId: number
): Promise<string[]> {
  const cached = storySlideshowUrlsCache.get(storyId);
  if (cached != null && cached.length > 1) return cached;

  const { data } = await axios.get<StoryDetailDto>(`${env.apiUrl}/api/stories/${storyId}`, {
    params: { faceId },
    headers: authHeaders(token),
  });
  const urls = (data.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => resolveApiMediaUrl(row.imageUrl));

  if (urls.length > 1) storySlideshowUrlsCache.set(storyId, urls);
  else storySlideshowUrlsCache.delete(storyId);

  return urls;
}

export async function fetchStoriesForFace(
  token: string,
  faceId: number
): Promise<StoryListItem[]> {
  const { data } = await axios.get<{
    items: StoryListItem[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }>(`${env.apiUrl}/api/stories`, {
    params: { faceId, page: 1, pageSize: 10 },
    headers: authHeaders(token),
  });
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchMyStories(
  token: string,
  faceId?: number
): Promise<StoryMineRow[]> {
  const { data } = await axios.get<StoryMineRow[]>(`${env.apiUrl}/api/stories/me`, {
    params: faceId != null ? { faceId } : {},
    headers: authHeaders(token),
  });
  return data;
}

export async function createStoryDraft(
  token: string,
  body: { title: string; faceIds?: number[] }
): Promise<{ id: number }> {
  const payload: Record<string, unknown> = { title: body.title };
  if (body.faceIds != null && body.faceIds.length > 0) {
    payload.faceIds = body.faceIds;
  }
  const { data } = await axios.post<{ id: number }>(`${env.apiUrl}/api/stories`, payload, {
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
  });
  return data;
}

export async function uploadStoryImage(
  token: string,
  storyId: number,
  file: File,
  sortOrder: number,
  description?: string
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  form.append('sortOrder', String(sortOrder));
  if (description) form.append('description', description);
  await axios.post(`${env.apiUrl}/api/stories/${storyId}/images`, form, {
    headers: authHeaders(token),
  });
}

export async function publishStory(
  token: string,
  storyId: number,
  scheduledPublishAt?: string | null
): Promise<void> {
  await axios.post(
    `${env.apiUrl}/api/stories/${storyId}/publish`,
    { scheduledPublishAt: scheduledPublishAt ?? null },
    { headers: { ...authHeaders(token), 'Content-Type': 'application/json' } }
  );
}

export async function deleteStory(token: string, storyId: number): Promise<void> {
  await axios.delete(`${env.apiUrl}/api/stories/${storyId}`, { headers: authHeaders(token) });
}
