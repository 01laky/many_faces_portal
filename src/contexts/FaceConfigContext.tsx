import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { markFaceVisited } from '../api/services/faceProfilesApi';
import * as profileApi from '../api/profile/profileApi';
import { useGlobalProfile } from '../hooks/api/useProfileApi';
import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';
import { logger } from '../utils/logger';
import { invalidateMemoizedFacePrefixCache } from '../api/config';
import { buildFaceHomePath, resolvePostAuthHomePath } from '../utils/faceHomePath';
import { supportedLanguages } from '../i18n/constants';
import { useFacesConfigQuery, useInvalidateFacesConfig } from '../hooks/api/useFacesConfigQuery';
import type { FaceConfigContextType, FaceConfigProviderProps } from './types';

const FaceConfigContext = createContext<FaceConfigContextType | undefined>(undefined);

export function FaceConfigProvider({ children }: FaceConfigProviderProps) {
	const location = useLocation();
	const { isAuthenticated, token } = useAuth();
	const {
		data: queryFaces,
		isLoading,
		error: queryError,
		refetch,
	} = useFacesConfigQuery(token, true);
	const invalidateFacesConfig = useInvalidateFacesConfig();
	const [selectedFaceId, setSelectedFaceId] = useState<number | null>(null);
	const [profileLastFaceApplied, setProfileLastFaceApplied] = useState(false);
	const { data: profile } = useGlobalProfile();

	const allFaces = queryFaces ?? [];
	const error = queryError ?? null;

	useEffect(() => {
		if (!isLoading && allFaces.length > 0) {
			logger.info('Faces config loaded', {
				faceCount: allFaces.length,
				isAuthenticated: Boolean(token),
			});
		}
	}, [isLoading, allFaces.length, token]);

	useEffect(() => {
		if (!isAuthenticated || !token || profileLastFaceApplied) return;
		queueMicrotask(() => {
			if (profile?.lastSelectedFaceId != null) {
				setSelectedFaceId(profile.lastSelectedFaceId);
			}
			setProfileLastFaceApplied(true);
		});
	}, [isAuthenticated, token, profileLastFaceApplied, profile?.lastSelectedFaceId]);

	const publicFaces = useMemo(() => allFaces.filter((f) => f.isPublic), [allFaces]);
	const privateFaces = useMemo(() => allFaces.filter((f) => !f.isPublic), [allFaces]);

	const availableFaces = useMemo(() => {
		if (!isAuthenticated) return publicFaces;
		const seen = new Set<number>();
		const out: FaceConfig[] = [];
		for (const f of [...privateFaces, ...publicFaces]) {
			if (seen.has(f.id)) continue;
			seen.add(f.id);
			out.push(f);
		}
		return out;
	}, [isAuthenticated, publicFaces, privateFaces]);

	const selectedFace = useMemo(() => {
		if (availableFaces.length === 0) return null;
		const found = availableFaces.find((f) => f.id === selectedFaceId);
		if (found) return found;
		return availableFaces[0];
	}, [availableFaces, selectedFaceId]);

	const selectFace = useCallback(
		(faceId: number) => {
			setSelectedFaceId(faceId);
			invalidateMemoizedFacePrefixCache();
			if (!token) return;
			void (async () => {
				try {
					await markFaceVisited(faceId, token);
					await profileApi.updateProfile(token, { lastSelectedFaceId: faceId });
					invalidateFacesConfig(token);
				} catch {
					// Face switch still applies locally; visit sync is best-effort
				}
			})();
		},
		[token, invalidateFacesConfig]
	);

	useEffect(() => {
		if (isLoading || availableFaces.length === 0) return;
		const parts = location.pathname.split('/').filter(Boolean);
		if (parts.length < 2) return;
		const faceSegment = parts[1];
		if (supportedLanguages.includes(faceSegment as (typeof supportedLanguages)[number])) return;
		const match = availableFaces.find((f) => f.index.toLowerCase() === faceSegment.toLowerCase());
		if (match && match.id !== selectedFaceId) {
			queueMicrotask(() => selectFace(match.id));
		}
	}, [location.pathname, isLoading, availableFaces, selectedFaceId, selectFace]);

	useEffect(() => {
		if (selectedFace && selectedFace.id !== selectedFaceId) {
			const id = selectedFace.id;
			queueMicrotask(() => setSelectedFaceId(id));
		}
	}, [selectedFace, selectedFaceId]);

	const getFaceHomePath = useCallback((): string => {
		if (!selectedFace) return '/homepage';
		return buildFaceHomePath(selectedFace);
	}, [selectedFace]);

	const getPostAuthHomePath = useCallback((): string => {
		return resolvePostAuthHomePath(availableFaces);
	}, [availableFaces]);

	const reload = useCallback(
		async (_authToken?: string | null): Promise<FacesConfigResponse> => {
			invalidateFacesConfig(_authToken ?? token);
			const result = await refetch();
			return result.data ?? [];
		},
		[invalidateFacesConfig, refetch, token]
	);

	const contextValue = useMemo(
		(): FaceConfigContextType => ({
			allFaces,
			publicFaces,
			privateFaces,
			availableFaces,
			selectedFace,
			selectFace,
			isLoading,
			error,
			reload,
			getFaceHomePath,
			getPostAuthHomePath,
		}),
		[
			allFaces,
			publicFaces,
			privateFaces,
			availableFaces,
			selectedFace,
			selectFace,
			isLoading,
			error,
			reload,
			getFaceHomePath,
			getPostAuthHomePath,
		]
	);

	return <FaceConfigContext.Provider value={contextValue}>{children}</FaceConfigContext.Provider>;
}

export function useFaceConfig() {
	const context = useContext(FaceConfigContext);
	if (context === undefined) {
		throw new Error('useFaceConfig must be used within a FaceConfigProvider');
	}
	return context;
}
