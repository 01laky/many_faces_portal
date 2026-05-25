import { authAwareFetch } from '../utils/authAwareFetch';
import { fetchAllListItems, parsePaginatedListEnvelope } from '../utils/parsePaginatedListEnvelope';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { absoluteScopedUrl } from '../faceApiRouting';

/** Member-facing join modes sent to POST live/join and live/refresh-token. */
export type VideoLoungeJoinMode = 'Viewer' | 'Listener' | 'Full';

export interface FaceVideoLoungeDto {
	id: number;
	faceId: number;
	title: string;
	description: string | null;
	isPublic: boolean;
	isSystemManaged: boolean;
	creatorUserId: string | null;
	maxParticipants: number;
	createdAt: string;
	updatedAt?: string | null;
	memberCount: number;
	hasLiveSession: boolean;
	liveParticipantCount: number;
	isHostViewer: boolean;
	canConnect: boolean;
	isMember: boolean;
	hasPendingRequest: boolean;
}

export interface VideoLoungeLiveParticipantDto {
	userId: string;
	displayName: string;
	avatarUrl: string | null;
	joinMode: string;
	audioEnabled: boolean;
	videoEnabled: boolean;
}

export interface VideoLoungeLiveSnapshotDto {
	hasLiveSession: boolean;
	liveParticipantCount: number;
	liveViewerCount: number;
	liveSpeakerCount: number;
	liveParticipants: VideoLoungeLiveParticipantDto[];
}

export interface VideoLoungeLiveJoinResultDto {
	sessionId: number;
	joinMode: VideoLoungeJoinMode;
	token: string;
	serverUrl: string;
	roomName: string;
	isStub: boolean;
	expiresAtUtc: string;
}

export class VideoLoungeApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'VideoLoungeApiError';
		this.status = status;
	}
}

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

/**
 * Throws VideoLoungeApiError when the response is not OK so callers can branch on status (e.g. 409 room full).
 */
async function assertOk(res: Response, fallback: string): Promise<void> {
	if (res.ok) return;
	const message = await getApiErrorMessage(res, fallback);
	throw new VideoLoungeApiError(message, res.status);
}

export async function listVideoLounges(
	faceId: number,
	token: string
): Promise<FaceVideoLoungeDto[]> {
	return fetchAllListItems<FaceVideoLoungeDto>(async (page, pageSize) => {
		const res = await apiFetch(
			`/api/faces/${faceId}/video-lounges?page=${page}&pageSize=${pageSize}`,
			{ method: 'GET', token }
		);
		if (!res.ok) throw new Error(await res.text());
		return parsePaginatedListEnvelope<FaceVideoLoungeDto>(await res.json());
	});
}

export async function getVideoLounge(
	faceId: number,
	loungeId: number,
	token: string
): Promise<FaceVideoLoungeDto> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}`, {
		method: 'GET',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function createVideoLounge(
	faceId: number,
	token: string,
	body: {
		title: string;
		description?: string | null;
		isPublic: boolean;
		maxParticipants?: number;
	}
): Promise<{ id: number }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges`, {
		method: 'POST',
		token,
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function joinPublicVideoLounge(
	faceId: number,
	loungeId: number,
	token: string
): Promise<{ joined?: boolean; alreadyMember?: boolean }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/join`, {
		method: 'POST',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function requestJoinVideoLounge(
	faceId: number,
	loungeId: number,
	token: string
): Promise<{ requestId?: number; pending?: boolean }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/join-requests`, {
		method: 'POST',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

/** Live roster and mode counts; stealth participants are omitted for members. */
export async function getVideoLoungeLive(
	faceId: number,
	loungeId: number,
	token: string
): Promise<VideoLoungeLiveSnapshotDto> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live`, {
		method: 'GET',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

/** Starts a live session when none is active; notifies lounge members via backend jobs. */
export async function startVideoLoungeLive(
	faceId: number,
	loungeId: number,
	token: string
): Promise<{ sessionId: number }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live/start`, {
		method: 'POST',
		token,
	});
	await assertOk(res, 'Could not start live session');
	return res.json();
}

/**
 * Connects to the active live session with the selected join mode.
 * Returns LiveKit (or stub) credentials — does not open WebRTC until the client connects.
 */
export async function joinVideoLoungeLive(
	faceId: number,
	loungeId: number,
	token: string,
	joinMode: VideoLoungeJoinMode
): Promise<VideoLoungeLiveJoinResultDto> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live/join`, {
		method: 'POST',
		token,
		body: JSON.stringify({ joinMode }),
	});
	await assertOk(res, 'Could not join live session');
	return res.json();
}

/** Best-effort leave while live; safe to call from pagehide/beforeunload. */
export async function leaveVideoLoungeLive(
	faceId: number,
	loungeId: number,
	token: string
): Promise<{ left: boolean }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live/leave`, {
		method: 'POST',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

/** Keeps the participant row fresh; server uses LastSeenAt for stale cleanup (~90s). */
export async function heartbeatVideoLoungeLive(
	faceId: number,
	loungeId: number,
	token: string
): Promise<{ ok: boolean }> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live/heartbeat`, {
		method: 'POST',
		token,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

/** Re-issues SFU token before TTL expiry without leaving the session. */
export async function refreshVideoLoungeLiveToken(
	faceId: number,
	loungeId: number,
	token: string,
	joinMode: VideoLoungeJoinMode
): Promise<Omit<VideoLoungeLiveJoinResultDto, 'sessionId' | 'joinMode'>> {
	const res = await apiFetch(`/api/faces/${faceId}/video-lounges/${loungeId}/live/refresh-token`, {
		method: 'POST',
		token,
		body: JSON.stringify({ joinMode }),
	});
	await assertOk(res, 'Could not refresh session token');
	return res.json();
}
