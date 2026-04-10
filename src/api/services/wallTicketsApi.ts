import { authAwareFetch } from '../utils/authAwareFetch';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { absoluteScopedUrl } from '../faceApiRouting';

const REQ_FAILED = 'Request failed';

async function apiFetch(path: string, options: RequestInit & { token?: string }) {
  const token = options.token;
  delete (options as Record<string, unknown>).token;
  const url = absoluteScopedUrl(path);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return authAwareFetch(url, { ...options, headers, token: token ?? undefined });
}

export interface WallTicketListItem {
  id: number;
  title: string;
  descriptionPreview: string;
  status: 'active' | 'approved' | 'denied';
  creatorId: string;
  creatorName: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  isAuthor: boolean;
  createdAt: string;
  canInteract: boolean;
  isHostViewer: boolean;
}

export interface WallTicketListResponse {
  items: WallTicketListItem[];
  isHostViewer: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface WallTicketComment {
  id: number;
  content: string;
  userId: string;
  authorName: string;
  createdAt: string;
}

export interface WallTicketDetail {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'approved' | 'denied';
  creatorId: string;
  creatorName: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  isAuthor: boolean;
  createdAt: string;
  updatedAt: string | null;
  canInteract: boolean;
  interactionsFrozen: boolean;
  isHostViewer: boolean;
  comments: WallTicketComment[];
}

export async function fetchWallTickets(
  token: string,
  faceId: number,
  page = 1,
  pageSize = 20
): Promise<WallTicketListResponse> {
  const res = await apiFetch(
    `/api/faces/${faceId}/wall-tickets?page=${page}&pageSize=${pageSize}`,
    { method: 'GET', token }
  );
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
  return res.json() as Promise<WallTicketListResponse>;
}

/** Loads all wall-ticket pages (pageSize 100) for client-side grid/carousel pagination. */
export async function fetchAllWallTicketsForFace(
  token: string,
  faceId: number,
  maxPages = 50
): Promise<WallTicketListItem[]> {
  const all: WallTicketListItem[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchWallTickets(token, faceId, page, 100);
    all.push(...res.items);
    if (all.length >= res.totalCount || res.items.length === 0) break;
  }
  return all;
}

export async function fetchWallTicketDetail(
  token: string,
  faceId: number,
  ticketId: number
): Promise<WallTicketDetail> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}`, { method: 'GET', token });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
  return res.json() as Promise<WallTicketDetail>;
}

export async function createWallTicket(
  token: string,
  faceId: number,
  body: { title: string; description: string }
): Promise<{ id: number; title: string; status: string; createdAt: string }> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
  return res.json() as Promise<{ id: number; title: string; status: string; createdAt: string }>;
}

export async function updateWallTicket(
  token: string,
  faceId: number,
  ticketId: number,
  body: { title?: string; description?: string }
): Promise<void> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function deleteWallTicket(token: string, faceId: number, ticketId: number): Promise<void> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}`, { method: 'DELETE', token });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function likeWallTicket(token: string, faceId: number, ticketId: number): Promise<void> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}/like`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function unlikeWallTicket(token: string, faceId: number, ticketId: number): Promise<void> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}/like`, {
    method: 'DELETE',
    token,
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function addWallTicketComment(
  token: string,
  faceId: number,
  ticketId: number,
  content: string
): Promise<WallTicketComment> {
  const res = await apiFetch(`/api/faces/${faceId}/wall-tickets/${ticketId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
  return res.json() as Promise<WallTicketComment>;
}
