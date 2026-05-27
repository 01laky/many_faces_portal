import type { AlbumItem } from '../../../api/services/AlbumsService';
import type { AlbumGridLayout } from '../../../utils/computeAlbumGridLayout';

export interface AlbumGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}

export type AlbumGridCardProps = {
	album: AlbumItem;
	index: number;
	gridLayout: AlbumGridLayout | null;
	onOpen: (albumId: number) => void;
};
