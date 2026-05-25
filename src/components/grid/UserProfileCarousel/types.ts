export interface UserProfileCarouselProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}
