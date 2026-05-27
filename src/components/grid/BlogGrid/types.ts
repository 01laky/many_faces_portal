import type { BlogItem } from '../../../api/services/BlogsService';

export interface BlogGridProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number, totalPages: number) => void;
}

export type BlogGridCardProps = {
	post: BlogItem;
	index: number;
	onOpen: (postId: number) => void;
};
