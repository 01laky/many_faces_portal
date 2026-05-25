export interface ChatRoomCarouselProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}
