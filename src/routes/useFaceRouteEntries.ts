import { useMemo } from 'react';
import type { FaceConfig } from '../api/types/facesConfig';
import { buildFacePagePaths } from './facePagePaths';
import type { FaceRouteEntry } from './types';

/** Expands the selected face’s pages into concrete `Route` keys/paths for `/:lang/*`. */
export function useFaceRouteEntries(selectedFace: FaceConfig | null): FaceRouteEntry[] {
  return useMemo(() => {
    if (!selectedFace) return [];
    const entries: FaceRouteEntry[] = [];
    for (const page of selectedFace.pages) {
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
  }, [selectedFace]);
}
