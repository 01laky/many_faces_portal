import { useQuery, type UseQueryResult } from '@tanstack/react-query';

/** Shared cache windows for face-scoped grid data (PT-RP2) — list and single-item hooks. */
export const GRID_LIST_STALE_MS = 5 * 60_000;
export const GRID_LIST_GC_MS = 20 * 60_000;

export function useFaceGridListQuery<T>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<T[]>,
	enabled: boolean
): UseQueryResult<T[], Error> {
	return useQuery({
		queryKey,
		queryFn,
		enabled,
		staleTime: GRID_LIST_STALE_MS,
		gcTime: GRID_LIST_GC_MS,
		retry: 1,
	});
}
