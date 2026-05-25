import type { WallTicketListResponse } from '../api/services/wallTicketsApi';

export type FetchWallTicketsPage = (
	token: string,
	faceId: number,
	page: number,
	pageSize: number
) => Promise<WallTicketListResponse>;

/**
 * Fetches the first page of wall tickets with `pageSize=1` only to read `isHostViewer` metadata from the API.
 * Returns `null` on transport errors so the hook can distinguish **unknown** from **true/false** host state.
 */
export async function loadWallHostViewerFlag(
	fetchPage: FetchWallTicketsPage,
	token: string,
	faceId: number
): Promise<boolean | null> {
	try {
		const res = await fetchPage(token, faceId, 1, 1);
		return res.isHostViewer;
	} catch {
		return null;
	}
}

/**
 * Whether to show "create wall item" affordances: feature flag + signed-in + known face + API said user is **not** host.
 * `isHost === null` means still loading or disabled — treat as false to avoid flashing create UI to hosts.
 */
export function computeCanShowWallCreate(
	enabled: boolean,
	token: string | null | undefined,
	faceId: number | undefined,
	isHost: boolean | null
): boolean {
	return enabled && !!token && faceId != null && isHost === false;
}
