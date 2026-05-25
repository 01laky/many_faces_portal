import { useEffect, useState } from 'react';
import { fetchWallTickets } from '../api/services/wallTicketsApi';
import { computeCanShowWallCreate, loadWallHostViewerFlag } from './wallHostViewerLogic';

export interface UseWallHostViewerOptions {
	enabled: boolean;
	token: string | null | undefined;
	faceId: number | undefined;
}

/**
 * Loads wall list meta to know if the current user is the face **host** (hosts get a different wall UX;
 * non-hosts may create certain wall content — product rule encoded in `computeCanShowWallCreate`).
 *
 * `isHost === null` means **unknown** (loading, missing inputs, or fetch error). `loading` tracks the
 * in-flight request; consumers should not treat `loading === false` + `isHost === null` as "not host".
 */
export function useWallHostViewer({ enabled, token, faceId }: UseWallHostViewerOptions) {
	const [isHost, setIsHost] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			// Yield once so StrictMode's mount→unmount→remount clears `cancelled` before network work starts,
			// avoiding setState on an unmounted instance while still keeping async flow flat (no flushSync).
			await Promise.resolve();
			if (!enabled || !token || faceId == null) {
				if (!cancelled) {
					setIsHost(null);
					setLoading(false);
				}
				return;
			}

			if (!cancelled) setLoading(true);
			try {
				const host = await loadWallHostViewerFlag(fetchWallTickets, token, faceId);
				if (!cancelled) setIsHost(host);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [enabled, token, faceId]);

	const canShowWallCreate = computeCanShowWallCreate(enabled, token, faceId, isHost);

	return { isHost, loading, canShowWallCreate };
}
