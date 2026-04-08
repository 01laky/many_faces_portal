import axios from 'axios';
import { env } from '../../config/env';

export async function markFaceVisited(faceId: number, token: string): Promise<void> {
  await axios.post(`${env.apiUrl}/api/faces/${faceId}/visit`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function exitFace(faceId: number, token: string): Promise<void> {
  await axios.post(`${env.apiUrl}/api/faces/${faceId}/exit-face`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface FaceProfileListItem {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export async function fetchFaceProfiles(
  faceId: number,
  token: string | undefined,
  page = 1,
  pageSize = 20
): Promise<{ items: FaceProfileListItem[]; totalCount: number }> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const { data } = await axios.get<{
    items: FaceProfileListItem[];
    totalCount: number;
  }>(`${env.apiUrl}/api/faces/${faceId}/profiles`, { params: { page, pageSize }, headers });
  return data;
}

/** Loads every profile page (100 per request) for grid pagination in the layout. */
export async function fetchAllFaceProfilesForFace(
  faceId: number,
  token: string | undefined,
  maxPages = 50
): Promise<FaceProfileListItem[]> {
  const all: FaceProfileListItem[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { items, totalCount } = await fetchFaceProfiles(faceId, token, page, 100);
    all.push(...items);
    if (all.length >= totalCount || items.length === 0) break;
  }
  return all;
}

export interface FaceProfileDetail {
  userId: string;
  displayName: string | null;
  nickname: string | null;
  age: number | null;
  rod: string | null;
  avatarUrl: string | null;
  createdAt: string;
  faceAllowsRecensions: boolean;
  likedByMe: boolean;
}

export async function fetchFaceProfile(
  faceId: number,
  userId: string,
  token: string | undefined
): Promise<FaceProfileDetail> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const { data } = await axios.get<FaceProfileDetail>(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}`,
    { headers }
  );
  return data;
}

export async function likeFaceProfile(faceId: number, userId: string, token: string): Promise<void> {
  await axios.post(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/like`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function unlikeFaceProfile(faceId: number, userId: string, token: string): Promise<void> {
  await axios.delete(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/like`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function postFaceProfileComment(
  faceId: number,
  userId: string,
  body: string,
  token: string
): Promise<void> {
  await axios.post(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/comments`,
    { body },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export interface FaceProfileCommentRow {
  id: number;
  userId: string;
  body: string;
  createdAt: string;
}

export async function fetchFaceProfileComments(
  faceId: number,
  userId: string,
  token: string | undefined
): Promise<FaceProfileCommentRow[]> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const { data } = await axios.get<FaceProfileCommentRow[]>(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/comments`,
    { headers }
  );
  return data;
}

export interface FaceProfileReviewRow {
  id: number;
  authorUserId: string;
  title: string;
  text: string;
  stars: number;
  createdAt: string;
}

export async function fetchFaceProfileReviews(
  faceId: number,
  userId: string,
  token: string | undefined
): Promise<FaceProfileReviewRow[]> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const { data } = await axios.get<FaceProfileReviewRow[]>(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/reviews`,
    { headers }
  );
  return data;
}

export async function upsertFaceProfileReview(
  faceId: number,
  userId: string,
  payload: { title: string; text: string; stars: number },
  token: string
): Promise<void> {
  await axios.post(
    `${env.apiUrl}/api/faces/${faceId}/profiles/${encodeURIComponent(userId)}/reviews`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
