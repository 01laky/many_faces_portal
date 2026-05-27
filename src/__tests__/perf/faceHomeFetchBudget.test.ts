import { describe, it, expect } from 'vitest';
import { FACE_HOME_API_BUDGET, gridQueryKeys } from '@/hooks/api/gridQueries/gridQueryKeys';
import { parsePageGridSchema } from '@/utils/pageGridSchema';

function uniqueGridKeysFromSchema(schemaJson: string, faceId: number): Set<string> {
	const schema = parsePageGridSchema(schemaJson);
	if (!schema) return new Set();
	const map: Record<string, (id: number) => readonly unknown[]> = {
		albumGrid: gridQueryKeys.albums,
		albumCarousel: gridQueryKeys.albums,
		blogGrid: gridQueryKeys.blogs,
		storyGrid: gridQueryKeys.stories,
		reelGrid: gridQueryKeys.reels,
		adGrid: gridQueryKeys.ads,
		userProfileGrid: gridQueryKeys.userProfiles,
		chatRoomGrid: gridQueryKeys.chatRooms,
		videoLoungeGrid: gridQueryKeys.videoLounges,
	};
	const keys = new Set<string>();
	for (const item of schema.items) {
		const ct = item.componentType;
		if (!ct || !(ct in map)) continue;
		keys.add(JSON.stringify(map[ct](faceId)));
	}
	return keys;
}

describe('faceHomeFetchBudget (PT-RP20)', () => {
	it('PT-RP20-U1: six-block schema within budget', () => {
		const keys = uniqueGridKeysFromSchema(
			JSON.stringify({
				items: [
					{ i: '1', componentType: 'albumGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '2', componentType: 'blogGrid', x: 0, y: 4, w: 6, h: 4 },
					{ i: '3', componentType: 'storyGrid', x: 0, y: 8, w: 6, h: 4 },
					{ i: '4', componentType: 'reelGrid', x: 0, y: 12, w: 6, h: 4 },
					{ i: '5', componentType: 'chatRoomGrid', x: 0, y: 16, w: 6, h: 4 },
					{ i: '6', componentType: 'videoLoungeGrid', x: 0, y: 20, w: 6, h: 4 },
				],
				breakpoints: { lg: 1200 },
				cols: { lg: 12 },
				rowHeight: 30,
			}),
			7
		);
		expect(keys.size).toBeLessThanOrEqual(FACE_HOME_API_BUDGET);
	});

	it('PT-RP20-U2: duplicate album grids dedupe keys', () => {
		const faceId = 3;
		const keys = [
			gridQueryKeys.albums(faceId),
			gridQueryKeys.albums(faceId),
			gridQueryKeys.blogs(faceId),
		];
		expect(new Set(keys.map((k) => JSON.stringify(k))).size).toBe(2);
	});

	it('eight distinct grid types at budget boundary', () => {
		const keys = uniqueGridKeysFromSchema(
			JSON.stringify({
				items: [
					{ i: '1', componentType: 'albumGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '2', componentType: 'blogGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '3', componentType: 'storyGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '4', componentType: 'reelGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '5', componentType: 'adGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '6', componentType: 'userProfileGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '7', componentType: 'chatRoomGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '8', componentType: 'videoLoungeGrid', x: 0, y: 0, w: 6, h: 4 },
				],
				breakpoints: { lg: 1200 },
				cols: { lg: 12 },
				rowHeight: 30,
			}),
			1
		);
		expect(keys.size).toBe(8);
		expect(keys.size).toBeLessThanOrEqual(FACE_HOME_API_BUDGET);
	});

	it('carousel and grid same resource share one key', () => {
		const faceId = 2;
		const keys = uniqueGridKeysFromSchema(
			JSON.stringify({
				items: [
					{ i: '1', componentType: 'albumGrid', x: 0, y: 0, w: 6, h: 4 },
					{ i: '2', componentType: 'albumCarousel', x: 0, y: 4, w: 6, h: 4 },
				],
				breakpoints: { lg: 1200 },
				cols: { lg: 12 },
				rowHeight: 30,
			}),
			faceId
		);
		expect(keys.size).toBe(1);
	});
});
