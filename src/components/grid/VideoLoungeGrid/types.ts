export interface VideoLoungeGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}
