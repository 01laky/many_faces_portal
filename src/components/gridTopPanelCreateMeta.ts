import type { GridComponentType } from './PageGridLayout';

export const GRID_TOP_PANEL_CREATE_LABEL: Record<GridComponentType, string> = {
  album: 'Album',
  albumGrid: 'Albums',
  albumCarousel: 'Albums',
  ad: 'Ad',
  adGrid: 'Ads',
  adCarousel: 'Ads',
  blog: 'Blog',
  blogGrid: 'Blog',
  blogCarousel: 'Blog',
  chatRoom: 'Chat',
  chatRoomGrid: 'Chats',
  chatRoomCarousel: 'Chats',
  userProfile: 'Profile',
  userProfileGrid: 'Profiles',
  userProfileCarousel: 'Profiles',
  reel: 'Reel',
  reelGrid: 'Reels',
  reelCarousel: 'Reels',
  story: 'Story',
  storyGrid: 'Stories',
  storyCarousel: 'Stories',
};

export function gridTopPanelHeaderTitle(state: { componentType: GridComponentType }): string {
  const label = GRID_TOP_PANEL_CREATE_LABEL[state.componentType];
  return `Create ${label}`;
}
