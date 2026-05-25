import { describe, expect, it } from 'vitest';
import { buildFaceRouteEntries } from '../buildFaceRouteEntries';
import type { FaceConfig } from '../../api/types/facesConfig';

function makeFace(pages: FaceConfig['pages']): FaceConfig {
	return {
		id: 1,
		index: 'demo',
		title: 'Demo',
		isPublic: true,
		pages,
	} as FaceConfig;
}

describe('buildFaceRouteEntries', () => {
	it('returns empty list when face is null', () => {
		expect(buildFaceRouteEntries(null)).toEqual([]);
	});

	it('skips profileDetail template pages', () => {
		const entries = buildFaceRouteEntries(
			makeFace([
				{
					id: 10,
					path: '/_profile-detail',
					pageType: { index: 'profileDetail' },
					routeTranslations: [],
				} as FaceConfig['pages'][number],
				{
					id: 11,
					path: '/wall',
					pageType: { index: 'wall' },
					routeTranslations: [],
				} as FaceConfig['pages'][number],
			])
		);
		expect(entries).toHaveLength(1);
		expect(entries[0].path).toBe('demo/wall');
		expect(entries[0].page.id).toBe(11);
	});

	it('emits translated paths in addition to base path', () => {
		const entries = buildFaceRouteEntries(
			makeFace([
				{
					id: 12,
					path: '/home',
					pageType: { index: 'home' },
					routeTranslations: [{ translatedRoute: '/domov' }],
				} as FaceConfig['pages'][number],
			])
		);
		expect(entries.map((e) => e.path).sort()).toEqual(['demo/domov', 'demo/home']);
	});
});
