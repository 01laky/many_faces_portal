/** BE list endpoints return { items, page, pageSize, totalCount, totalPages } (admin-face-detail §1.7). */
export interface PaginatedListEnvelope<T> {
	items: T[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export function parsePaginatedListEnvelope<T>(body: unknown): PaginatedListEnvelope<T> {
	if (body && typeof body === 'object' && 'items' in body) {
		const o = body as PaginatedListEnvelope<T>;
		return {
			items: Array.isArray(o.items) ? o.items : [],
			page: typeof o.page === 'number' ? o.page : 1,
			pageSize: typeof o.pageSize === 'number' ? o.pageSize : o.items.length,
			totalCount: typeof o.totalCount === 'number' ? o.totalCount : o.items.length,
			totalPages: typeof o.totalPages === 'number' ? o.totalPages : 1,
		};
	}
	if (Array.isArray(body)) {
		const items = body as T[];
		return { items, page: 1, pageSize: items.length, totalCount: items.length, totalPages: 1 };
	}
	return { items: [], page: 1, pageSize: 0, totalCount: 0, totalPages: 0 };
}

/** Align with admin/server list default page size (10). */
export const PORTAL_LIST_PAGE_SIZE = 10;

/** Load all pages when a grid needs more than one page (rare); default chunk size is 10. */
export async function fetchAllListItems<T>(
	fetchPage: (page: number, pageSize: number) => Promise<PaginatedListEnvelope<T>>,
	pageSize = PORTAL_LIST_PAGE_SIZE
): Promise<T[]> {
	const first = await fetchPage(1, pageSize);
	if (first.totalPages <= 1) return first.items;
	const all = [...first.items];
	for (let p = 2; p <= first.totalPages; p++) {
		const next = await fetchPage(p, pageSize);
		all.push(...next.items);
	}
	return all;
}
