import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { wallTicketsQueryKey } from '@/hooks/api/useWallTicketsQuery';

describe('useWallTicketsQuery keys (PT-RP14)', () => {
	it('PT-RP14-U1: host and section share same key for same face page', () => {
		const hostKey = wallTicketsQueryKey(5, 1, 20);
		const sectionKey = wallTicketsQueryKey(5, 1, 20);
		expect(hostKey).toEqual(sectionKey);
		expect(hostKey).toEqual(['wall', 'tickets', 5, 1, 20]);
	});

	it('different pages produce distinct keys', () => {
		expect(wallTicketsQueryKey(5, 1, 20)).not.toEqual(wallTicketsQueryKey(5, 2, 20));
	});

	it('QueryClient dedupes in-flight identical keys', async () => {
		const client = new QueryClient();
		const fetchFn = vi.fn(async () => ({ items: [], totalCount: 0 }));
		const key = wallTicketsQueryKey(3, 1, 10);
		await Promise.all([
			client.fetchQuery({ queryKey: key, queryFn: fetchFn }),
			client.fetchQuery({ queryKey: key, queryFn: fetchFn }),
		]);
		expect(fetchFn).toHaveBeenCalledTimes(1);
	});
});
