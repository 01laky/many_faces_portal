import { useMemo } from 'react';
import type { FaceConfig } from '../api/types/facesConfig';
import { buildFaceRouteEntries } from './buildFaceRouteEntries';
import type { FaceRouteEntry } from './types';

/** React hook wrapper around {@link buildFaceRouteEntries} for the active face config. */
export function useFaceRouteEntries(selectedFace: FaceConfig | null): FaceRouteEntry[] {
	return useMemo(() => buildFaceRouteEntries(selectedFace), [selectedFace]);
}
