import type { AlbumItem } from '../../../api/services/AlbumsService';

export interface AlbumFormProps {
	editAlbum?: AlbumItem | null;
	onSaved?: (album: AlbumItem) => void;
	onCancel?: () => void;
}
