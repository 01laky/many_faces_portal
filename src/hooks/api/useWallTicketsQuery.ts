import { useQuery } from '@tanstack/react-query';
import { fetchWallTickets, type WallTicketListResponse } from '@/api/services/wallTicketsApi';

export function wallTicketsQueryKey(
	faceId: number,
	page: number,
	pageSize: number
): readonly ['wall', 'tickets', number, number, number] {
	return ['wall', 'tickets', faceId, page, pageSize] as const;
}

const WALL_TICKETS_STALE_MS = 60_000;

export function useWallTicketsQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	page: number,
	pageSize: number,
	enabled = true
) {
	return useQuery<WallTicketListResponse, Error>({
		queryKey: wallTicketsQueryKey(faceId ?? 0, page, pageSize),
		queryFn: () => fetchWallTickets(token!, faceId!, page, pageSize),
		enabled: Boolean(enabled && token && faceId != null),
		staleTime: WALL_TICKETS_STALE_MS,
		gcTime: 10 * 60_000,
		retry: 1,
	});
}
