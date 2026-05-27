import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const GRID_LIST_STALE_MS = 5 * 60_000;

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
		gcTime: 20 * 60_000,
		retry: 1,
	});
}
