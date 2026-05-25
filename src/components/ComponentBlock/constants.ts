import {
	Album,
	LayoutGrid,
	FileText,
	Megaphone,
	MessageCircle,
	User,
	Film,
	BookOpen,
	Video,
	type LucideIcon,
} from 'lucide-react';
import type { GridComponentType } from '../PageGridLayout';

export const COMPONENT_DEFAULTS: Record<
	GridComponentType,
	{ title: string; icon: LucideIcon; hasFooter: boolean }
> = {
	album: { title: 'Album', icon: Album, hasFooter: false },
	albumGrid: { title: 'Albums', icon: LayoutGrid, hasFooter: true },
	albumCarousel: { title: 'Albums', icon: LayoutGrid, hasFooter: true },
	ad: { title: 'Ad', icon: Megaphone, hasFooter: false },
	adGrid: { title: 'Ads', icon: LayoutGrid, hasFooter: true },
	adCarousel: { title: 'Ads', icon: LayoutGrid, hasFooter: true },
	blog: { title: 'Blog', icon: FileText, hasFooter: false },
	blogGrid: { title: 'Blog', icon: LayoutGrid, hasFooter: true },
	blogCarousel: { title: 'Blog', icon: LayoutGrid, hasFooter: true },
	chatRoom: { title: 'Chat', icon: MessageCircle, hasFooter: false },
	chatRoomGrid: { title: 'Chats', icon: LayoutGrid, hasFooter: true },
	chatRoomCarousel: { title: 'Chats', icon: LayoutGrid, hasFooter: true },
	userProfile: { title: 'Profile', icon: User, hasFooter: false },
	userProfileGrid: { title: 'Profiles', icon: LayoutGrid, hasFooter: true },
	userProfileCarousel: { title: 'Profiles', icon: LayoutGrid, hasFooter: true },
	reel: { title: 'Reel', icon: Film, hasFooter: false },
	reelGrid: { title: 'Reels', icon: LayoutGrid, hasFooter: true },
	reelCarousel: { title: 'Reels', icon: LayoutGrid, hasFooter: true },
	story: { title: 'Story', icon: BookOpen, hasFooter: false },
	storyGrid: { title: 'Stories', icon: LayoutGrid, hasFooter: true },
	storyCarousel: { title: 'Stories', icon: LayoutGrid, hasFooter: true },
	videoLounge: { title: 'Video lounge', icon: Video, hasFooter: false },
	videoLoungeGrid: { title: 'Video lounges', icon: LayoutGrid, hasFooter: true },
	videoLoungeCarousel: { title: 'Video lounges', icon: LayoutGrid, hasFooter: true },
};

export const ALBUM_COMPONENT_TYPES: GridComponentType[] = ['album', 'albumGrid', 'albumCarousel'];
export const BLOG_COMPONENT_TYPES: GridComponentType[] = ['blog', 'blogGrid', 'blogCarousel'];
export const REEL_COMPONENT_TYPES: GridComponentType[] = ['reel', 'reelGrid', 'reelCarousel'];
export const CHAT_ROOM_COMPONENT_TYPES: GridComponentType[] = [
	'chatRoom',
	'chatRoomGrid',
	'chatRoomCarousel',
];
export const VIDEO_LOUNGE_COMPONENT_TYPES: GridComponentType[] = [
	'videoLounge',
	'videoLoungeGrid',
	'videoLoungeCarousel',
];
