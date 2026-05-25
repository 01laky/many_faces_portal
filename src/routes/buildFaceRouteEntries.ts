import type { FaceConfig } from '../api/types/facesConfig';
import { buildFacePagePaths } from './facePagePaths';
import type { FaceRouteEntry } from './types';

/**
 * Expands configured face pages into concrete router entries.
 * Skips `profileDetail` template pages — those are rendered only via the dedicated profile route.
 */
export function buildFaceRouteEntries(selectedFace: FaceConfig | null): FaceRouteEntry[] {
	if (!selectedFace) return [];
	const entries: FaceRouteEntry[] = [];
	for (const page of selectedFace.pages) {
		if (page.pageType?.index === 'profileDetail') continue;
		for (const path of buildFacePagePaths(selectedFace, page)) {
			entries.push({
				key: `${selectedFace.id}-${page.id}-${path}`,
				path,
				isPublic: selectedFace.isPublic,
				page,
			});
		}
	}
	return entries;
}
