export interface ReelGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}
