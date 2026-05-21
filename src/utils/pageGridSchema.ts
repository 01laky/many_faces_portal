export const COMPONENT_SETTINGS_STORAGE_PREFIX = 'component-settings-';

export type GridComponentType =
  | 'album'
  | 'albumGrid'
  | 'albumCarousel'
  | 'ad'
  | 'adGrid'
  | 'adCarousel'
  | 'blog'
  | 'blogGrid'
  | 'blogCarousel'
  | 'chatRoom'
  | 'chatRoomGrid'
  | 'chatRoomCarousel'
  | 'userProfile'
  | 'userProfileGrid'
  | 'userProfileCarousel'
  | 'reel'
  | 'reelGrid'
  | 'reelCarousel'
  | 'story'
  | 'storyGrid'
  | 'storyCarousel'
  | 'videoLounge'
  | 'videoLoungeGrid'
  | 'videoLoungeCarousel';

export interface PageGridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  label?: string;
  componentType?: GridComponentType;
  title?: string | null;
  icon?: string | null;
  boundChatRoomId?: number;
  boundVideoLoungeId?: number;
}

export interface PageGridSchema {
  items: PageGridItem[];
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
  rowHeight: number;
}

/** Parses face page `gridSchema` JSON; returns null when JSON is invalid or items are empty. */
export function parsePageGridSchema(gridSchemaJson: string): PageGridSchema | null {
  try {
    const parsed = JSON.parse(gridSchemaJson) as PageGridSchema;
    if (!parsed?.items?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reads persisted carousel autoplay flag for a grid block (admin component settings). */
export function readComponentBlockAutoplay(
  componentId: string,
  storage: Pick<Storage, 'getItem'> | undefined = typeof localStorage !== 'undefined'
    ? localStorage
    : undefined
): boolean {
  if (!storage) return false;
  try {
    const raw = storage.getItem(COMPONENT_SETTINGS_STORAGE_PREFIX + componentId);
    if (!raw) return false;
    return Boolean(JSON.parse(raw).autoplay);
  } catch {
    return false;
  }
}

/** Advances carousel page index; wraps to page 0 after the last page. */
export function advanceCarouselPage(page: number, totalPages: number): number {
  const safeTotal = Math.max(1, totalPages);
  return page >= safeTotal - 1 ? 0 : page + 1;
}
