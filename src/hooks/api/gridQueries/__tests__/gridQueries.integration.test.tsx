/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useAlbumsGridQuery } from '@/hooks/api/gridQueries';

vi.mock('@/api/services/AlbumsService', () => ({
	getAlbums: vi.fn(async () => [{ id: 1, title: 'A' }]),
}));

function wrapper(client: QueryClient) {
	return function W({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client }, children);
	};
}

describe('useFaceGridListQuery integration (PT-RP2)', () => {
	let client: QueryClient;

	beforeEach(() => {
		client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		vi.clearAllMocks();
	});

	it('PT-RP2-U1: duplicate hooks dedupe to one fetch', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		const props = { token: 'jwt', faceId: 9, fetchEnabled: true };
		renderHook(() => useAlbumsGridQuery(props.token, props.faceId, props.fetchEnabled), {
			wrapper: wrapper(client),
		});
		renderHook(() => useAlbumsGridQuery(props.token, props.faceId, props.fetchEnabled), {
			wrapper: wrapper(client),
		});
		await waitFor(() => expect(getAlbums).toHaveBeenCalledTimes(1));
	});

	it('PT-RP2-U2: disabled when fetchEnabled false', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		renderHook(() => useAlbumsGridQuery('jwt', 9, false), { wrapper: wrapper(client) });
		await new Promise((r) => setTimeout(r, 20));
		expect(getAlbums).not.toHaveBeenCalled();
	});

	it('PT-RP2-U2b: disabled without token', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		renderHook(() => useAlbumsGridQuery(null, 9, true), { wrapper: wrapper(client) });
		await new Promise((r) => setTimeout(r, 20));
		expect(getAlbums).not.toHaveBeenCalled();
	});
});
