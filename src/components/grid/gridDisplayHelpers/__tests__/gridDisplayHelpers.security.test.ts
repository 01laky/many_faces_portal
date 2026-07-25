/**
 * PSH1-D3 / FE-P3 — the grid display helpers are the single source of the `src` value for every
 * member avatar and story cover on the grid surfaces (Story, StoryGrid, StoryCarousel, UserProfile,
 * UserProfileGrid, UserProfileCarousel, ChatRoomCard, VideoLoungeCard, LivePanel, LobbyPanel).
 * A rejected API URL must degrade to the neutral placeholder that is already shown when the API
 * sends no image at all — never to the raw untrusted value.
 */
import { describe, expect, it } from 'vitest';
import { profileAvatarUrl, storyRingImageUrl } from '../gridDisplayHelpers';

const PLACEHOLDER_PREFIX = 'data:image/svg+xml;charset=UTF-8,';

describe('gridDisplayHelpers media allow-list (PSH1-T-D20 … D23)', () => {
	it('PSH1-T-D20: https CDN avatar is kept as-is', () => {
		expect(profileAvatarUrl('user-1', 'https://cdn.example.com/avatars/u1.png')).toBe(
			'https://cdn.example.com/avatars/u1.png'
		);
	});

	it('PSH1-T-D21: rejected avatar URLs fall back to the initials placeholder', () => {
		const rejected = [
			'javascript:alert(1)',
			'http://tracker.example.com/avatars/u1.png',
			'data:text/html,<script>alert(1)</script>',
			'https://api.example.com/acme/api/uploads/serve?path=%2Fuploads%2Fa.png',
			'not a url',
		];
		for (const value of rejected) {
			const src = profileAvatarUrl('ada lovelace', value);
			expect(src.startsWith(PLACEHOLDER_PREFIX)).toBe(true);
			expect(src).toContain('AL');
		}
	});

	it('PSH1-T-D22: backend-signed uploads/serve avatar is kept as-is', () => {
		const signed =
			'https://api.example.com/acme/api/uploads/serve?path=%2Fuploads%2Fa.png&exp=9999999999&sig=deadbeef';
		expect(profileAvatarUrl('user-1', signed)).toBe(signed);
	});

	it('PSH1-T-D23: missing avatar URL keeps the existing initials placeholder', () => {
		for (const value of [null, '', '   ']) {
			const src = profileAvatarUrl('ada lovelace', value);
			expect(src.startsWith(PLACEHOLDER_PREFIX)).toBe(true);
			expect(src).toContain('AL');
		}
	});

	it('PSH1-T-D23b: story covers follow the same allow-list, falling back to the Story placeholder', () => {
		expect(storyRingImageUrl(7, 'https://cdn.example.com/stories/7.png')).toBe(
			'https://cdn.example.com/stories/7.png'
		);
		for (const value of [
			'javascript:alert(1)',
			'http://tracker.example.com/7.png',
			'/uploads/7.png',
			null,
		]) {
			const src = storyRingImageUrl(7, value);
			expect(src.startsWith(PLACEHOLDER_PREFIX)).toBe(true);
			expect(src).toContain('Story');
		}
	});
});
