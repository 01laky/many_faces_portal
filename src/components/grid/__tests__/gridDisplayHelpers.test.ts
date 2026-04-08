import { describe, it, expect } from 'vitest';
import {
  wallTicketListingImageUrl,
  albumCoverPlaceholderUrl,
  storyRingImageUrl,
  profileAvatarUrl,
} from '../gridDisplayHelpers';

describe('gridDisplayHelpers', () => {
  it('wallTicketListingImageUrl is stable per id', () => {
    expect(wallTicketListingImageUrl(42)).toContain('wt42');
  });

  it('albumCoverPlaceholderUrl includes album id', () => {
    expect(albumCoverPlaceholderUrl(7)).toContain('album7');
  });

  it('storyRingImageUrl prefers cover when set', () => {
    expect(storyRingImageUrl(1, 'https://example.com/c.jpg')).toBe('https://example.com/c.jpg');
    expect(storyRingImageUrl(99, null)).toContain('storyring99');
  });

  it('profileAvatarUrl prefers avatar when set', () => {
    expect(profileAvatarUrl('u1', 'https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(profileAvatarUrl('abc', null)).toMatch(/^https:\/\/picsum\.photos\//);
  });
});
