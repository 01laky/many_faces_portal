import { getAlbums } from '@/api/services/AlbumsService';
import { getBlogs } from '@/api/services/BlogsService';
import { getReels } from '@/api/services/ReelsService';
import { fetchStoriesForFace } from '@/api/services/storiesApi';
import { fetchAllWallTicketsForFace } from '@/api/services/wallTicketsApi';
import { fetchAllFaceProfilesForFace } from '@/api/services/faceProfilesApi';
import { getChatRoom, listChatRooms } from '@/api/services/ChatRoomsService';
import { getVideoLounge, listVideoLounges } from '@/api/services/VideoLoungesService';
import { gridQueryKeys } from './gridQueryKeys';
import { useFaceGridListQuery } from './useFaceGridListQuery';
import { useFaceGridItemQuery } from './useFaceGridItemQuery';

function gridEnabled(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
): boolean {
	return Boolean(fetchEnabled && token && faceId != null);
}

export function useAlbumsGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.albums(faceId ?? 0),
		() => getAlbums(token!, faceId!),
		enabled
	);
}

export function useBlogsGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.blogs(faceId ?? 0),
		() => getBlogs(token!, faceId!),
		enabled
	);
}

export function useStoriesGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.stories(faceId ?? 0),
		() => fetchStoriesForFace(token!, faceId!),
		enabled
	);
}

export function useReelsGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.reels(faceId ?? 0),
		() => getReels(token!, faceId!),
		enabled
	);
}

export function useAdsGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.ads(faceId ?? 0),
		() => fetchAllWallTicketsForFace(token!, faceId!),
		enabled
	);
}

export function useUserProfilesGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.userProfiles(faceId ?? 0),
		() => fetchAllFaceProfilesForFace(faceId!, token!),
		enabled
	);
}

export function useChatRoomsGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.chatRooms(faceId ?? 0),
		() => listChatRooms(faceId!, token!),
		enabled
	);
}

export function useVideoLoungesGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled);
	return useFaceGridListQuery(
		gridQueryKeys.videoLounges(faceId ?? 0),
		() => listVideoLounges(faceId!, token!),
		enabled
	);
}

/**
 * Single chat room for a tile bound via `boundChatRoomId` in the grid JSON.
 * Disabled entirely when no binding id is present — unbound tiles reuse
 * `useChatRoomsGridQuery` (shared list key) and show the first room instead.
 */
export function useChatRoomBoundGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	chatRoomId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled) && chatRoomId != null;
	return useFaceGridItemQuery(
		gridQueryKeys.chatRoom(faceId ?? 0, chatRoomId ?? 0),
		() => getChatRoom(faceId!, chatRoomId!, token!),
		enabled
	);
}

/**
 * Single video lounge for a tile bound via `boundVideoLoungeId` in the grid JSON.
 * Mirrors `useChatRoomBoundGridQuery` — see that hook for the enabled contract.
 */
export function useVideoLoungeBoundGridQuery(
	token: string | null | undefined,
	faceId: number | null | undefined,
	videoLoungeId: number | null | undefined,
	fetchEnabled = true
) {
	const enabled = gridEnabled(token, faceId, fetchEnabled) && videoLoungeId != null;
	return useFaceGridItemQuery(
		gridQueryKeys.videoLounge(faceId ?? 0, videoLoungeId ?? 0),
		() => getVideoLounge(faceId!, videoLoungeId!, token!),
		enabled
	);
}
