import { describe, it, expect } from 'vitest';
import { collectGridTypesForFace } from '@/hooks/usePrefetchFaceHomeQueries';
import type { FaceConfig } from '@/api/types/facesConfig';

const faceWithGrids: FaceConfig = {
	id: 1,
	index: 'demo',
	isPublic: true,
	pages: [
		{
			id: 10,
			path: '/homepage',
			gridSchema: JSON.stringify({
				items: [
					{ i: 'a', x: 0, y: 0, w: 6, h: 4, componentType: 'albumGrid' },
					{ i: 'b', x: 0, y: 4, w: 6, h: 4, componentType: 'blogGrid' },
					{ i: 'c', x: 0, y: 8, w: 6, h: 4, componentType: 'storyCarousel' },
					{ i: 'd', x: 0, y: 12, w: 6, h: 4, componentType: 'reelGrid' },
					{ i: 'e', x: 0, y: 16, w: 6, h: 4, componentType: 'chatRoomGrid' },
				],
				breakpoints: { lg: 1200 },
				cols: { lg: 12 },
				rowHeight: 30,
			}),
		},
	],
} as FaceConfig;

describe('collectGridTypesForFace / prefetch (PT-RP25)', () => {
	it('PT-RP25-U1: collects unique grid types from face pages', () => {
		const types = collectGridTypesForFace(faceWithGrids);
		expect(types).toContain('albumGrid');
		expect(types).toContain('blogGrid');
		expect(types).toContain('storyCarousel');
		expect(new Set(types).size).toBe(types.length);
	});

	it('PT-RP25-U4: same face schema yields same type set', () => {
		const a = collectGridTypesForFace(faceWithGrids);
		const b = collectGridTypesForFace(faceWithGrids);
		expect(a.sort()).toEqual(b.sort());
	});

	it('PT-RP25-U2: empty pages yields empty types', () => {
		const empty = { ...faceWithGrids, pages: [] } as FaceConfig;
		expect(collectGridTypesForFace(empty)).toEqual([]);
	});

	it('caps at schema items without duplicate component types', () => {
		const dupFace = {
			...faceWithGrids,
			pages: [
				{
					...faceWithGrids.pages[0],
					gridSchema: JSON.stringify({
						items: [
							{ i: '1', x: 0, y: 0, w: 6, h: 4, componentType: 'albumGrid' },
							{ i: '2', x: 0, y: 4, w: 6, h: 4, componentType: 'albumGrid' },
						],
						breakpoints: { lg: 1200 },
						cols: { lg: 12 },
						rowHeight: 30,
					}),
				},
			],
		} as FaceConfig;
		expect(collectGridTypesForFace(dupFace)).toEqual(['albumGrid']);
	});
});
