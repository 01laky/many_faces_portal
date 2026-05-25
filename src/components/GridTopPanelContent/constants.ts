import type { GridComponentType } from '../PageGridLayout';

export const ALBUM_TYPES: GridComponentType[] = ['album', 'albumGrid', 'albumCarousel'];

export const BLOG_TYPES: GridComponentType[] = ['blog', 'blogGrid', 'blogCarousel'];

export const REEL_TYPES: GridComponentType[] = ['reel', 'reelGrid', 'reelCarousel'];

export const CHAT_TYPES: GridComponentType[] = ['chatRoom', 'chatRoomGrid', 'chatRoomCarousel'];

export const VIDEO_LOUNGE_TYPES: GridComponentType[] = [
	'videoLounge',
	'videoLoungeGrid',
	'videoLoungeCarousel',
];
export const UNSUPPORTED_CREATE_COPY_KEY: Partial<Record<GridComponentType, string>> = {
	ad: 'gridBlocks.createUnsupported.ad',
	adGrid: 'gridBlocks.createUnsupported.ad',
	adCarousel: 'gridBlocks.createUnsupported.ad',
	story: 'gridBlocks.createUnsupported.story',
	storyGrid: 'gridBlocks.createUnsupported.story',
	storyCarousel: 'gridBlocks.createUnsupported.story',
	userProfile: 'gridBlocks.createUnsupported.userProfile',
	userProfileGrid: 'gridBlocks.createUnsupported.userProfile',
	userProfileCarousel: 'gridBlocks.createUnsupported.userProfile',
};
