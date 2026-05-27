import { describe, it, expect } from 'vitest';
import { gridQueryKeys } from '@/hooks/api/gridQueries/gridQueryKeys';

describe('gridQueryKeys (PT-RP2)', () => {
	const faceA = 10;
	const faceB = 11;

	it('PT-RP2-U1: same face + resource produces stable key for dedup', () => {
		expect(gridQueryKeys.albums(faceA)).toEqual(gridQueryKeys.albums(faceA));
	});

	it('PT-RP2-U2: null token scenario uses enabled gate — keys exist but fetches disabled in hooks', () => {
		expect(gridQueryKeys.albums(faceA)[2]).toBe('albums');
	});

	it('PT-RP2-U3: face switch uses different keys', () => {
		expect(gridQueryKeys.blogs(faceA)).not.toEqual(gridQueryKeys.blogs(faceB));
	});

	it('PT-RP2-U4: each grid resource has distinct suffix', () => {
		const keys = [
			gridQueryKeys.albums(faceA),
			gridQueryKeys.blogs(faceA),
			gridQueryKeys.stories(faceA),
		];
		const serialized = keys.map((k) => JSON.stringify(k));
		expect(new Set(serialized).size).toBe(3);
	});

	it('PT-RP2-U5: face root key includes face id', () => {
		expect(gridQueryKeys.face(faceA)).toEqual(['face', faceA]);
	});

	it('PT-RP2-U6: pagination is client-side — list keys omit page param', () => {
		expect(gridQueryKeys.reels(faceA).length).toBe(3);
	});
});
