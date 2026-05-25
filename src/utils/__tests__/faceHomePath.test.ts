import { describe, expect, it } from 'vitest';
import type { FaceConfig } from '../../api/types/facesConfig';
import {
	buildFaceHomePath,
	pickPreferredPrivateFace,
	resolvePostAuthHomePath,
} from '../faceHomePath';

function face(
	partial: Partial<FaceConfig> & Pick<FaceConfig, 'id' | 'index' | 'isPublic'>
): FaceConfig {
	return {
		title: partial.index,
		description: '',
		gradientSettings: null,
		visibility: 'Public',
		allowRecensions: false,
		chatRoomsCreate: false,
		pages: partial.pages ?? [
			{
				index: 1,
				id: 1,
				name: 'Home',
				description: '',
				path: '/home',
				gridSchema: null,
				pageType: { index: 'home', id: 1 },
				routeTranslations: [],
			},
		],
		...partial,
	};
}

describe('faceHomePath', () => {
	it('buildFaceHomePath returns face index and home segment', () => {
		expect(buildFaceHomePath(face({ id: 1, index: 'basic', isPublic: false }))).toBe('/basic/home');
	});

	it('pickPreferredPrivateFace prefers basic', () => {
		const faces = [
			face({ id: 2, index: 'koncept', isPublic: false }),
			face({ id: 1, index: 'basic', isPublic: false }),
			face({ id: 3, index: 'public', isPublic: true }),
		];
		expect(pickPreferredPrivateFace(faces)?.index).toBe('basic');
	});

	it('resolvePostAuthHomePath uses first private face', () => {
		const faces = [
			face({ id: 3, index: 'public', isPublic: true }),
			face({ id: 1, index: 'koncept', isPublic: false }),
		];
		expect(resolvePostAuthHomePath(faces)).toBe('/koncept/home');
	});

	it('resolvePostAuthHomePath falls back to first face when no private', () => {
		const faces = [face({ id: 3, index: 'public', isPublic: true })];
		expect(resolvePostAuthHomePath(faces)).toBe('/public/home');
	});
});
