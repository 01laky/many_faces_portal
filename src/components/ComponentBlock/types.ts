import type { ReactNode } from 'react';
import type { AlbumItem } from '../../api/services/AlbumsService';
import type { BlogItem } from '../../api/services/BlogsService';
import type { ReelItem } from '../../api/services/ReelsService';
import type { GridComponentType } from '../PageGridLayout';

export interface ComponentBlockProps {
	componentId: string;
	componentType: GridComponentType;
	title?: string | null;
	icon?: string | null;
	children: ReactNode;
	/** For grid/carousel: current page index (0-based) */
	page?: number;
	totalPages?: number;
	onPrev?: () => void;
	onNext?: () => void;
	onPlayPause?: (playing: boolean) => void;
	/** Initial playing from localStorage */
	autoplayFromStorage?: boolean;
	/** Album to edit (opens local panel) */
	editAlbum?: AlbumItem | null;
	onAlbumSaved?: (album: AlbumItem) => void;
	/** Blog to edit (opens local panel) */
	editBlog?: BlogItem | null;
	onBlogSaved?: (blog: BlogItem) => void;
	/** Reel to edit (opens local panel) */
	editReel?: ReelItem | null;
	onReelSaved?: (reel: ReelItem) => void;
}
