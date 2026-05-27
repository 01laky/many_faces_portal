import { computeCanShowWallCreate } from './wallHostViewerLogic';
import { useWallTicketsQuery } from '@/hooks/api/useWallTicketsQuery';

export interface UseWallHostViewerOptions {
	enabled: boolean;
	token: string | null | undefined;
	faceId: number | undefined;
}

/**
 * Loads wall list meta to know if the current user is the face **host**.
 * Shares TanStack Query cache with `WallTicketsSection` (PT-RP14).
 */
export function useWallHostViewer({ enabled, token, faceId }: UseWallHostViewerOptions) {
	const queryEnabled = Boolean(enabled && token && faceId != null);
	const { data, isLoading, isError } = useWallTicketsQuery(token, faceId, 1, 20, queryEnabled);

	const isHost: boolean | null = !queryEnabled
		? null
		: isLoading
			? null
			: isError || !data
				? null
				: data.isHostViewer;

	const canShowWallCreate = computeCanShowWallCreate(enabled, token, faceId, isHost);

	return { isHost, loading: isLoading, canShowWallCreate };
}
