/**
 * @vitest-environment happy-dom
 *
 * Single-tile grid blocks after the useEffect → TanStack Query migration
 * (fe-grid-face-scope-rollout §2/§7): the tiles must use the SAME query hooks
 * as their Grid/Carousel siblings — shared per-face cache key (PT-RP2 dedup),
 * IO-gated fetch (PT-RP16), and unchanged guest/loading/empty/error states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Album } from '@/components/grid/Album';
import { ChatRoom } from '@/components/grid/ChatRoom';
import { Story } from '@/components/grid/Story';
import { GridBlockFetchProvider } from '@/contexts/GridBlockFetchContext';
import { gridBlockI18nKeys as k } from '@/components/grid/gridBlockI18n';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: vi.fn(() => ({ token: 'jwt' })),
}));

vi.mock('@/contexts/FaceConfigContext', () => ({
	useFaceConfig: vi.fn(() => ({ selectedFace: { id: 7, index: 'demo' } })),
}));

vi.mock('@/hooks/useLocalizedLink', () => ({
	useLocalizedLink: () => (path: string) => path,
}));

vi.mock('@/api/services/AlbumsService', () => ({
	getAlbums: vi.fn(),
}));

vi.mock('@/api/services/ChatRoomsService', () => ({
	listChatRooms: vi.fn(),
	getChatRoom: vi.fn(),
}));

vi.mock('@/api/services/storiesApi', () => ({
	fetchStoriesForFace: vi.fn(),
}));

function chatRoomFixture(id: number, title: string) {
	return {
		id,
		faceId: 7,
		title,
		description: null,
		isPublic: true,
		isSystemManaged: false,
		creatorUserId: null,
		createdAt: '2026-01-01T00:00:00Z',
		lastMessageAt: null,
		memberCount: 3,
		isHostViewer: false,
		canParticipate: true,
		isMember: true,
	};
}

function renderWithProviders(ui: ReactNode, opts?: { fetchEnabled?: boolean }) {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<MemoryRouter>
				<GridBlockFetchProvider fetchEnabled={opts?.fetchEnabled ?? true}>
					{ui}
				</GridBlockFetchProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
}

describe('single-tile grid blocks use the shared grid query hooks', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { useAuth } = await import('@/contexts/AuthContext');
		vi.mocked(useAuth).mockReturnValue({ token: 'jwt' } as ReturnType<typeof useAuth>);
		const { useFaceConfig } = await import('@/contexts/FaceConfigContext');
		vi.mocked(useFaceConfig).mockReturnValue({
			selectedFace: { id: 7, index: 'demo' },
		} as ReturnType<typeof useFaceConfig>);
		const { getAlbums } = await import('@/api/services/AlbumsService');
		vi.mocked(getAlbums).mockResolvedValue([{ id: 1, title: 'First album' }] as Awaited<
			ReturnType<typeof getAlbums>
		>);
		const { listChatRooms, getChatRoom } = await import('@/api/services/ChatRoomsService');
		vi.mocked(listChatRooms).mockResolvedValue([chatRoomFixture(21, 'General')]);
		vi.mocked(getChatRoom).mockResolvedValue(chatRoomFixture(42, 'Bound room'));
		const { fetchStoriesForFace } = await import('@/api/services/storiesApi');
		vi.mocked(fetchStoriesForFace).mockResolvedValue([]);
	});

	it('Album: two tiles dedupe to one fetch on the shared albums key (PT-RP2)', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		renderWithProviders(
			<>
				<Album />
				<Album />
			</>
		);
		await waitFor(() => expect(screen.getAllByAltText('First album').length).toBe(2));
		expect(getAlbums).toHaveBeenCalledTimes(1);
		expect(getAlbums).toHaveBeenCalledWith('jwt', 7);
	});

	it('Album: guest state without token — message shown, no fetch', async () => {
		const { useAuth } = await import('@/contexts/AuthContext');
		vi.mocked(useAuth).mockReturnValue({ token: null } as ReturnType<typeof useAuth>);
		const { getAlbums } = await import('@/api/services/AlbumsService');
		renderWithProviders(<Album />);
		expect(screen.getByText(k.guest.albums)).toBeTruthy();
		await new Promise((r) => setTimeout(r, 20));
		expect(getAlbums).not.toHaveBeenCalled();
	});

	it('Album: fetch deferred while the tile is offscreen (PT-RP16)', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		renderWithProviders(<Album />, { fetchEnabled: false });
		await new Promise((r) => setTimeout(r, 20));
		expect(getAlbums).not.toHaveBeenCalled();
	});

	it('Album: empty face shows the empty-albums message', async () => {
		const { getAlbums } = await import('@/api/services/AlbumsService');
		vi.mocked(getAlbums).mockResolvedValue([]);
		renderWithProviders(<Album />);
		await waitFor(() => expect(screen.getByText(k.empty.albumsFace)).toBeTruthy());
	});

	it('ChatRoom: unbound tile uses the shared list query and shows the first room', async () => {
		const { listChatRooms, getChatRoom } = await import('@/api/services/ChatRoomsService');
		renderWithProviders(<ChatRoom />);
		await waitFor(() => expect(screen.getByText('General')).toBeTruthy());
		expect(listChatRooms).toHaveBeenCalledWith(7, 'jwt');
		expect(getChatRoom).not.toHaveBeenCalled();
	});

	it('ChatRoom: bound tile uses the single-item query only', async () => {
		const { listChatRooms, getChatRoom } = await import('@/api/services/ChatRoomsService');
		renderWithProviders(<ChatRoom boundChatRoomId={42} />);
		await waitFor(() => expect(screen.getByText('Bound room')).toBeTruthy());
		expect(getChatRoom).toHaveBeenCalledWith(7, 42, 'jwt');
		expect(listChatRooms).not.toHaveBeenCalled();
	});

	it('ChatRoom: empty face shows the empty-rooms message (error path degrades the same way)', async () => {
		const { listChatRooms } = await import('@/api/services/ChatRoomsService');
		vi.mocked(listChatRooms).mockRejectedValue(new Error('boom'));
		renderWithProviders(<ChatRoom />);
		await waitFor(() => expect(screen.getByText(k.empty.chatRooms)).toBeTruthy(), {
			timeout: 4000,
		});
	});

	it('Story: query error maps to the dedicated load-error message', async () => {
		const { fetchStoriesForFace } = await import('@/api/services/storiesApi');
		vi.mocked(fetchStoriesForFace).mockRejectedValue(new Error('boom'));
		renderWithProviders(<Story />);
		await waitFor(() => expect(screen.getByText(k.loadError.stories)).toBeTruthy(), {
			timeout: 4000,
		});
	});

	it('Story: empty face shows the no-active-stories message', async () => {
		renderWithProviders(<Story />);
		await waitFor(() => expect(screen.getByText(k.empty.storiesActive)).toBeTruthy());
	});
});
