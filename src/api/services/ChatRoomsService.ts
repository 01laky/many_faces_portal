import { authAwareFetch } from '../utils/authAwareFetch';
import { fetchAllListItems, parsePaginatedListEnvelope } from '../utils/parsePaginatedListEnvelope';
import { absoluteScopedUrl } from '../faceApiRouting';

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

export interface FaceChatRoomDto {
  id: number;
  faceId: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  isSystemManaged: boolean;
  creatorUserId: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  memberCount: number;
  messageCount?: number | null;
  isHostViewer: boolean;
  canParticipate: boolean;
  isMember: boolean;
  hasPendingRequest: boolean;
}

export interface FaceChatRoomMessageDto {
  id: number;
  senderUserId: string;
  content: string;
  sentAt: string;
}

export async function listChatRooms(
  faceId: number,
  token: string
): Promise<FaceChatRoomDto[]> {
  return fetchAllListItems<FaceChatRoomDto>(async (page, pageSize) => {
    const res = await apiFetch(
      `/api/faces/${faceId}/chat-rooms?page=${page}&pageSize=${pageSize}`,
      { method: 'GET', token },
    );
    if (!res.ok) throw new Error(await res.text());
    return parsePaginatedListEnvelope<FaceChatRoomDto>(await res.json());
  });
}

export async function getChatRoom(
  faceId: number,
  roomId: number,
  token: string
): Promise<FaceChatRoomDto> {
  const res = await apiFetch(`/api/faces/${faceId}/chat-rooms/${roomId}`, {
    method: 'GET',
    token,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createChatRoom(
  faceId: number,
  token: string,
  body: { title: string; description?: string | null; isPublic: boolean }
): Promise<{ id: number }> {
  const res = await apiFetch(`/api/faces/${faceId}/chat-rooms`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function joinPublicChatRoom(
  faceId: number,
  roomId: number,
  token: string
): Promise<{ joined?: boolean; alreadyMember?: boolean }> {
  const res = await apiFetch(`/api/faces/${faceId}/chat-rooms/${roomId}/join`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function requestJoinChatRoom(
  faceId: number,
  roomId: number,
  token: string
): Promise<{ requestId?: number; pending?: boolean }> {
  const res = await apiFetch(`/api/faces/${faceId}/chat-rooms/${roomId}/join-requests`, {
    method: 'POST',
    token,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getChatRoomMessages(
  faceId: number,
  roomId: number,
  token: string,
  params?: { pageSize?: number; beforeId?: number }
): Promise<FaceChatRoomMessageDto[]> {
  const q = new URLSearchParams();
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  if (params?.beforeId != null) q.set('beforeId', String(params.beforeId));
  const qs = q.toString();
  const res = await apiFetch(
    `/api/faces/${faceId}/chat-rooms/${roomId}/messages${qs ? `?${qs}` : ''}`,
    { method: 'GET', token }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
