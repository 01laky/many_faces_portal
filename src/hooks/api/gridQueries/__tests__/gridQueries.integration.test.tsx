/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import {
	useAlbumsGridQuery,
	useChatRoomBoundGridQuery,
	useVideoLoungeBoundGridQuery,
} from '@/hooks/api/gridQueries';

vi.mock('@/api/services/AlbumsService', () => ({
	getAlbums: vi.fn(async () => [{ id: 1, title: 'A' }]),
}));

vi.mock('@/api/services/ChatRoomsService', () => ({
	listChatRooms: vi.fn(async () => []),
	getChatRoom: vi.fn(async () => ({ id: 42, title: 'Bound room' })),
}));

vi.mock('@/api/services/VideoLoungesService', () => ({
	listVideoLounges: vi.fn(async () => []),
	getVideoLounge: vi.fn(async () => ({ id: 6, title: 'Bound lounge' })),
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

describe('bound single-item grid hooks (grid useEffect migration)', () => {
	let client: QueryClient;

	beforeEach(() => {
		client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		vi.clearAllMocks();
	});

	it('chat-room bound hook fetches the bound id with face + token', async () => {
		const { getChatRoom } = await import('@/api/services/ChatRoomsService');
		const { result } = renderHook(() => useChatRoomBoundGridQuery('jwt', 9, 42, true), {
			wrapper: wrapper(client),
		});
		await waitFor(() => expect(getChatRoom).toHaveBeenCalledWith(9, 42, 'jwt'));
		await waitFor(() => expect(result.current.data).toEqual({ id: 42, title: 'Bound room' }));
	});

	it('chat-room bound hook stays disabled without a binding id', async () => {
		const { getChatRoom } = await import('@/api/services/ChatRoomsService');
		renderHook(() => useChatRoomBoundGridQuery('jwt', 9, null, true), {
			wrapper: wrapper(client),
		});
		await new Promise((r) => setTimeout(r, 20));
		expect(getChatRoom).not.toHaveBeenCalled();
	});

	it('chat-room bound hook stays disabled when fetchEnabled is false (PT-RP16)', async () => {
		const { getChatRoom } = await import('@/api/services/ChatRoomsService');
		renderHook(() => useChatRoomBoundGridQuery('jwt', 9, 42, false), {
			wrapper: wrapper(client),
		});
		await new Promise((r) => setTimeout(r, 20));
		expect(getChatRoom).not.toHaveBeenCalled();
	});

	it('video-lounge bound hook fetches the bound id with face + token', async () => {
		const { getVideoLounge } = await import('@/api/services/VideoLoungesService');
		const { result } = renderHook(() => useVideoLoungeBoundGridQuery('jwt', 9, 6, true), {
			wrapper: wrapper(client),
		});
		await waitFor(() => expect(getVideoLounge).toHaveBeenCalledWith(9, 6, 'jwt'));
		await waitFor(() => expect(result.current.data).toEqual({ id: 6, title: 'Bound lounge' }));
	});

	it('video-lounge bound hook stays disabled without token', async () => {
		const { getVideoLounge } = await import('@/api/services/VideoLoungesService');
		renderHook(() => useVideoLoungeBoundGridQuery(null, 9, 6, true), {
			wrapper: wrapper(client),
		});
		await new Promise((r) => setTimeout(r, 20));
		expect(getVideoLounge).not.toHaveBeenCalled();
	});
});
