import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { GridComponentType } from '@/utils/pageGridSchema';

type GridBlockProps = Record<string, unknown>;

type GridLoader = () => Promise<{ default: ComponentType<GridBlockProps> }>;

const GRID_BLOCK_LOADERS: Record<GridComponentType, GridLoader> = {
	album: () => import('./Album/Album').then((m) => ({ default: m.Album })),
	albumGrid: () => import('./AlbumGrid/AlbumGrid').then((m) => ({ default: m.AlbumGrid })),
	albumCarousel: () =>
		import('./AlbumCarousel/AlbumCarousel').then((m) => ({ default: m.AlbumCarousel })),
	ad: () => import('./Ad/Ad').then((m) => ({ default: m.Ad })),
	adGrid: () => import('./AdGrid/AdGrid').then((m) => ({ default: m.AdGrid })),
	adCarousel: () => import('./AdCarousel/AdCarousel').then((m) => ({ default: m.AdCarousel })),
	blog: () => import('./Blog/Blog').then((m) => ({ default: m.Blog })),
	blogGrid: () => import('./BlogGrid/BlogGrid').then((m) => ({ default: m.BlogGrid })),
	blogCarousel: () =>
		import('./BlogCarousel/BlogCarousel').then((m) => ({ default: m.BlogCarousel })),
	chatRoom: () => import('./ChatRoom/ChatRoom').then((m) => ({ default: m.ChatRoom })),
	chatRoomGrid: () =>
		import('./ChatRoomGrid/ChatRoomGrid').then((m) => ({ default: m.ChatRoomGrid })),
	chatRoomCarousel: () =>
		import('./ChatRoomCarousel/ChatRoomCarousel').then((m) => ({ default: m.ChatRoomCarousel })),
	userProfile: () => import('./UserProfile/UserProfile').then((m) => ({ default: m.UserProfile })),
	userProfileGrid: () =>
		import('./UserProfileGrid/UserProfileGrid').then((m) => ({ default: m.UserProfileGrid })),
	userProfileCarousel: () =>
		import('./UserProfileCarousel/UserProfileCarousel').then((m) => ({
			default: m.UserProfileCarousel,
		})),
	reel: () => import('./Reel/Reel').then((m) => ({ default: m.Reel })),
	reelGrid: () => import('./ReelGrid/ReelGrid').then((m) => ({ default: m.ReelGrid })),
	reelCarousel: () =>
		import('./ReelCarousel/ReelCarousel').then((m) => ({ default: m.ReelCarousel })),
	story: () => import('./Story/Story').then((m) => ({ default: m.Story })),
	storyGrid: () => import('./StoryGrid/StoryGrid').then((m) => ({ default: m.StoryGrid })),
	storyCarousel: () =>
		import('./StoryCarousel/StoryCarousel').then((m) => ({ default: m.StoryCarousel })),
	videoLounge: () => import('./VideoLounge/VideoLounge').then((m) => ({ default: m.VideoLounge })),
	videoLoungeGrid: () =>
		import('./VideoLoungeGrid/VideoLoungeGrid').then((m) => ({ default: m.VideoLoungeGrid })),
	videoLoungeCarousel: () =>
		import('./VideoLoungeCarousel/VideoLoungeCarousel').then((m) => ({
			default: m.VideoLoungeCarousel,
		})),
};

const lazyCache = new Map<GridComponentType, LazyExoticComponent<ComponentType<GridBlockProps>>>();

/** PT-RP1 — dynamic import per schema componentType. */
export function getLazyGridBlock(
	componentType: GridComponentType
): LazyExoticComponent<ComponentType<GridBlockProps>> {
	let cached = lazyCache.get(componentType);
	if (!cached) {
		const loader = GRID_BLOCK_LOADERS[componentType];
		cached = lazy(loader);
		lazyCache.set(componentType, cached);
	}
	return cached;
}

export function isKnownGridComponentType(value: string | undefined): value is GridComponentType {
	return value != null && value in GRID_BLOCK_LOADERS;
}

/** Test helper — reset lazy cache between Vitest cases. */
export function resetGridBlockRegistryForTests(): void {
	lazyCache.clear();
}

export { GRID_BLOCK_LOADERS };
