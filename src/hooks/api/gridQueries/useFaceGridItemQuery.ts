import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GRID_LIST_STALE_MS, GRID_LIST_GC_MS } from './useFaceGridListQuery';

/**
 * Single-item sibling of `useFaceGridListQuery` for grid tiles bound to one entity
 * (e.g. `boundChatRoomId` / `boundVideoLoungeId` in the page grid JSON).
 * Uses the same cache windows and retry policy so a bound tile behaves exactly
 * like its list-based Grid/Carousel siblings (PT-RP2 dedup + PT-RP16 IO gating).
 */
export function useFaceGridItemQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T>,
	enabled: boolean
): UseQueryResult<T, Error> {
	return useQuery({
		queryKey,
		queryFn,
		enabled,
		staleTime: GRID_LIST_STALE_MS,
		gcTime: GRID_LIST_GC_MS,
		retry: 1,
	});
}
