export const STORY_GRID_GAP = 8;

export const STORY_LABEL_PX = 22;

export const DEFAULT_ITEMS_PER_PAGE = 8;

/** Floor for thumb width; thumb image height = 2× (1:2). 75px → 150px tall vs former 44→88 (~+70% height). */
export const STORY_MIN_THUMB_WIDTH_PX = 75;

export const STORY_GRID_LAYOUT_OPTS = {
	gap: STORY_GRID_GAP,
	minThumbWidthPx: STORY_MIN_THUMB_WIDTH_PX,
	labelPx: STORY_LABEL_PX,
	maxCols: 12,
	maxRows: 10,
	maxItemsPerPage: 60,
} as const;
