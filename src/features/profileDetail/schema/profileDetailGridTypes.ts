export type ProfileDetailSectionType =
  | 'profileHero'
  | 'profileMeta'
  | 'profileActions'
  | 'profileComments'
  | 'profileReviews'
  | 'userAlbums'
  | 'userBlogs'
  | 'userReels'
  | 'userStories'
  | 'spacer';

export interface ProfileDetailGridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  sectionType: ProfileDetailSectionType;
  props?: Record<string, unknown>;
}

export interface ProfileDetailGridSchema {
  schemaVersion?: number;
  items: ProfileDetailGridItem[];
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
  rowHeight: number;
}

export const PROFILE_DETAIL_SECTION_TYPES: ProfileDetailSectionType[] = [
  'profileHero',
  'profileMeta',
  'profileActions',
  'profileComments',
  'profileReviews',
  'userAlbums',
  'userBlogs',
  'userReels',
  'userStories',
  'spacer',
];
