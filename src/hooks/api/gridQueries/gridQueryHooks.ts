import { getAlbums } from '@/api/services/AlbumsService';
import { getBlogs } from '@/api/services/BlogsService';
import { getReels } from '@/api/services/ReelsService';
import { fetchStoriesForFace } from '@/api/services/storiesApi';
import { fetchAllWallTicketsForFace } from '@/api/services/wallTicketsApi';
import { fetchAllFaceProfilesForFace } from '@/api/services/faceProfilesApi';
import { listChatRooms } from '@/api/services/ChatRoomsService';
import { listVideoLounges } from '@/api/services/VideoLoungesService';
import { gridQueryKeys } from './gridQueryKeys';
import { useFaceGridListQuery } from './useFaceGridListQuery';

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
