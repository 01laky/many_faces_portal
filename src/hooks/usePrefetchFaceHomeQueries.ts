import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { FaceConfig } from '@/api/types/facesConfig';
import { parsePageGridSchema, type GridComponentType } from '@/utils/pageGridSchema';
import { gridQueryKeys } from '@/hooks/api/gridQueries/gridQueryKeys';
import { getAlbums } from '@/api/services/AlbumsService';
import { getBlogs } from '@/api/services/BlogsService';
import { getReels } from '@/api/services/ReelsService';
import { fetchStoriesForFace } from '@/api/services/storiesApi';
import { fetchAllWallTicketsForFace } from '@/api/services/wallTicketsApi';
import { fetchAllFaceProfilesForFace } from '@/api/services/faceProfilesApi';
import { listChatRooms } from '@/api/services/ChatRoomsService';
import { listVideoLounges } from '@/api/services/VideoLoungesService';

const GRID_LIST_STALE_MS = 5 * 60_000;
const MAX_PREFETCH = 3;

const GRID_TYPE_TO_KEY: Partial<Record<GridComponentType, (faceId: number) => readonly unknown[]>> =
	{
		albumGrid: gridQueryKeys.albums,
		albumCarousel: gridQueryKeys.albums,
		album: gridQueryKeys.albums,
		blogGrid: gridQueryKeys.blogs,
		blogCarousel: gridQueryKeys.blogs,
		blog: gridQueryKeys.blogs,
		storyGrid: gridQueryKeys.stories,
		storyCarousel: gridQueryKeys.stories,
		story: gridQueryKeys.stories,
		reelGrid: gridQueryKeys.reels,
		reelCarousel: gridQueryKeys.reels,
		reel: gridQueryKeys.reels,
		adGrid: gridQueryKeys.ads,
		adCarousel: gridQueryKeys.ads,
		ad: gridQueryKeys.ads,
		userProfileGrid: gridQueryKeys.userProfiles,
		userProfileCarousel: gridQueryKeys.userProfiles,
		userProfile: gridQueryKeys.userProfiles,
		chatRoomGrid: gridQueryKeys.chatRooms,
		chatRoomCarousel: gridQueryKeys.chatRooms,
		chatRoom: gridQueryKeys.chatRooms,
		videoLoungeGrid: gridQueryKeys.videoLounges,
		videoLoungeCarousel: gridQueryKeys.videoLounges,
		videoLounge: gridQueryKeys.videoLounges,
	};

const GRID_TYPE_TO_FN: Partial<
	Record<GridComponentType, (token: string, faceId: number) => Promise<unknown[]>>
> = {
	albumGrid: getAlbums,
	albumCarousel: getAlbums,
	album: getAlbums,
	blogGrid: getBlogs,
	blogCarousel: getBlogs,
	blog: getBlogs,
	storyGrid: fetchStoriesForFace,
	storyCarousel: fetchStoriesForFace,
	story: fetchStoriesForFace,
	reelGrid: getReels,
	reelCarousel: getReels,
	reel: getReels,
	adGrid: fetchAllWallTicketsForFace,
	adCarousel: fetchAllWallTicketsForFace,
	ad: fetchAllWallTicketsForFace,
	userProfileGrid: (token, faceId) => fetchAllFaceProfilesForFace(faceId, token),
	userProfileCarousel: (token, faceId) => fetchAllFaceProfilesForFace(faceId, token),
	userProfile: (token, faceId) => fetchAllFaceProfilesForFace(faceId, token),
	chatRoomGrid: (token, faceId) => listChatRooms(faceId, token),
	chatRoomCarousel: (token, faceId) => listChatRooms(faceId, token),
	chatRoom: (token, faceId) => listChatRooms(faceId, token),
	videoLoungeGrid: (token, faceId) => listVideoLounges(faceId, token),
	videoLoungeCarousel: (token, faceId) => listVideoLounges(faceId, token),
	videoLounge: (token, faceId) => listVideoLounges(faceId, token),
};

/** Exported for PT-RP25 tests and prefetch budget assertions. */
export function collectGridTypesForFace(face: FaceConfig): GridComponentType[] {
	const types = new Set<GridComponentType>();
	for (const page of face.pages) {
		if (!page.gridSchema) continue;
		const schema = parsePageGridSchema(page.gridSchema);
		if (!schema) continue;
		for (const item of schema.items) {
			if (item.componentType) types.add(item.componentType);
		}
	}
	return [...types];
}

/** PT-RP25 — warm grid Query cache before face navigation. */
export function usePrefetchFaceHomeQueries(token: string | null | undefined) {
	const queryClient = useQueryClient();
	const inflightRef = useRef<number | null>(null);

	const prefetchFaceHome = useCallback(
		(face: FaceConfig) => {
			if (!token) return;
			if (inflightRef.current === face.id) return;
			inflightRef.current = face.id;

			const types = collectGridTypesForFace(face).slice(0, MAX_PREFETCH);
			for (const type of types) {
				const keyFn = GRID_TYPE_TO_KEY[type];
				const fetchFn = GRID_TYPE_TO_FN[type];
				if (!keyFn || !fetchFn) continue;
				const queryKey = keyFn(face.id);
				void queryClient.prefetchQuery({
					queryKey,
					queryFn: () => fetchFn(token, face.id),
					staleTime: GRID_LIST_STALE_MS,
				});
			}
		},
		[queryClient, token]
	);

	const cancelPrefetch = useCallback(() => {
		inflightRef.current = null;
	}, []);

	return { prefetchFaceHome, cancelPrefetch };
}
