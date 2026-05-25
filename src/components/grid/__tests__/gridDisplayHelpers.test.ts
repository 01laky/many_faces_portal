import { describe, it, expect } from 'vitest';
import {
	wallTicketListingImageUrl,
	albumCoverPlaceholderUrl,
	albumThumbnailPlaceholderUrl,
	blogCoverPlaceholderUrl,
	storyRingImageUrl,
	profileAvatarUrl,
} from '../gridDisplayHelpers';

describe('gridDisplayHelpers', () => {
	it('wallTicketListingImageUrl returns a local neutral image', () => {
		expect(wallTicketListingImageUrl(42)).toMatch(/^data:image\/svg\+xml/);
		expect(decodeURIComponent(wallTicketListingImageUrl(42))).toContain('No listing image');
	});

	it('album placeholders return local neutral images', () => {
		expect(albumCoverPlaceholderUrl(7)).toMatch(/^data:image\/svg\+xml/);
		expect(decodeURIComponent(albumCoverPlaceholderUrl(7))).toContain('No album cover');
		expect(decodeURIComponent(albumThumbnailPlaceholderUrl(7, 1))).toContain('Photo 2');
	});

	it('blogCoverPlaceholderUrl returns a local neutral image', () => {
		expect(blogCoverPlaceholderUrl()).toMatch(/^data:image\/svg\+xml/);
		expect(decodeURIComponent(blogCoverPlaceholderUrl())).toContain('No blog image');
	});

	it('storyRingImageUrl prefers cover when set', () => {
		expect(storyRingImageUrl(1, 'https://example.com/c.jpg')).toBe('https://example.com/c.jpg');
		expect(decodeURIComponent(storyRingImageUrl(99, null))).toContain('Story');
	});

	it('profileAvatarUrl prefers avatar when set', () => {
		expect(profileAvatarUrl('u1', 'https://example.com/a.png')).toBe('https://example.com/a.png');
		expect(profileAvatarUrl('abc', null)).toMatch(/^data:image\/svg\+xml/);
		expect(decodeURIComponent(profileAvatarUrl('abc', null))).toContain('A');
	});
});
