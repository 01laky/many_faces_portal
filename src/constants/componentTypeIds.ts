import type { GridComponentType } from '../components/PageGridLayout';

/**
 * ComponentTypeId enum matching BE ComponentTypeId values.
 * Maps every GridComponentType variant to its base component type ID.
 */
export const COMPONENT_TYPE_ID: Record<GridComponentType, number> = {
  ad: 1,
  adGrid: 1,
  adCarousel: 1,
  album: 2,
  albumGrid: 2,
  albumCarousel: 2,
  blog: 3,
  blogGrid: 3,
  blogCarousel: 3,
  chatRoom: 4,
  chatRoomGrid: 4,
  chatRoomCarousel: 4,
  userProfile: 5,
  userProfileGrid: 5,
  userProfileCarousel: 5,
  story: 6,
  storyGrid: 6,
  storyCarousel: 6,
  reel: 7,
  reelGrid: 7,
  reelCarousel: 7,
  videoLounge: 8,
  videoLoungeGrid: 8,
  videoLoungeCarousel: 8,
};
