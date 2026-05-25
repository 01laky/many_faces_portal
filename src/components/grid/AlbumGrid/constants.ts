export const ALBUM_GRID_GAP_PX = 6;

export const DEFAULT_ITEMS_PER_PAGE = 8;

export const ALBUM_GRID_LAYOUT_OPTS = {
	gap: ALBUM_GRID_GAP_PX,
	/** 2× prior 88px floor → fewer columns, larger thumbnails when space allows */
	minTilePx: 176,
	maxCols: 12,
	maxRows: 10,
	maxItemsPerPage: 48,
} as const;
