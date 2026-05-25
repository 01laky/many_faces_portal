export interface ReelCarouselProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}
