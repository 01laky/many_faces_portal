import { describe, it, expect } from 'vitest';
import * as lazyPages from '@/routes/lazyPages';

const LAZY_PAGE_EXPORTS = [
	'HomePage',
	'FacePageView',
	'HomePageProtected',
	'ProfilePage',
	'UsersPage',
	'UserDetailPage',
	'ComponentListPage',
	'ComponentDetailPage',
	'AlbumDetailPage',
	'BlogDetailPage',
	'ReelDetailPage',
	'FaceProfilesListPage',
	'FaceProfileDetailPage',
	'StoriesListPage',
	'MySubmissionsPage',
	'VideoLoungeDetailPage',
] as const;

describe('lazyPages (PT-RP21)', () => {
	it('PT-RP21-U1: face home routes are React.lazy components', () => {
		for (const name of LAZY_PAGE_EXPORTS) {
			const Comp = lazyPages[name];
			expect(Comp).toBeDefined();
			expect(typeof Comp).toBe('object');
			expect(Comp).toHaveProperty('$$typeof');
		}
	});

	it('PT-RP21-U2: home and protected home are distinct lazy boundaries', () => {
		expect(lazyPages.HomePage).not.toBe(lazyPages.HomePageProtected);
		expect(lazyPages.HomePage).not.toBe(lazyPages.FacePageView);
	});

	it('PT-RP21-U4: detail pages lazy-load separately from home shell', () => {
		expect(lazyPages.AlbumDetailPage).not.toBe(lazyPages.HomePage);
		expect(lazyPages.ComponentDetailPage).not.toBe(lazyPages.ComponentListPage);
	});
});
