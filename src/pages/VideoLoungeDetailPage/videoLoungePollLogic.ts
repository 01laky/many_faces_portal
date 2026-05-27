export const LIVE_ROSTER_POLL_MS = 12_000;

/** PT-RP13 — pause roster poll when tab hidden or not in lobby/live. */
export function resolveVideoLoungeRefetchInterval(
	pageVisible: boolean,
	phase: string
): number | false {
	if (!pageVisible) return false;
	if (phase === 'lobby' || phase === 'live') return LIVE_ROSTER_POLL_MS;
	return false;
}

export function shouldRunVideoLoungeHeartbeat(input: {
	pageVisible: boolean;
	phase: string;
	faceId: number | null;
	token: string | null;
}): boolean {
	return (
		input.phase === 'live' && input.pageVisible && input.faceId != null && Boolean(input.token)
	);
}
