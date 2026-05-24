import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getFacesConfig } from '../api/config/getFacesConfig';
import { markFaceVisited } from '../api/services/faceProfilesApi';
import * as profileApi from '../api/profile/profileApi';
import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';
import { logger } from '../utils/logger';
import { invalidateMemoizedFacePrefixCache } from '../api/config';
import { buildFaceHomePath, resolvePostAuthHomePath } from '../utils/faceHomePath';
import { supportedLanguages } from '../i18n/constants';

interface FaceConfigContextType {
  allFaces: FacesConfigResponse;
  publicFaces: FaceConfig[];
  privateFaces: FaceConfig[];
  availableFaces: FaceConfig[];
  selectedFace: FaceConfig | null;
  selectFace: (faceId: number) => void;
  isLoading: boolean;
  error: Error | null;
  reload: (authToken?: string | null) => Promise<FacesConfigResponse>;
  getFaceHomePath: () => string;
  getPostAuthHomePath: () => string;
}

const FaceConfigContext = createContext<FaceConfigContextType | undefined>(undefined);

export function FaceConfigProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  const [allFaces, setAllFaces] = useState<FacesConfigResponse>([]);
  const [selectedFaceId, setSelectedFaceId] = useState<number | null>(null);
  const [profileLastFaceApplied, setProfileLastFaceApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadGenerationRef = useRef(0);

  const loadConfig = useCallback(
    async (authToken?: string | null): Promise<FacesConfigResponse> => {
      const generation = ++loadGenerationRef.current;
      await Promise.resolve();
      const effectiveToken =
        authToken !== undefined && authToken !== null
          ? authToken
          : isAuthenticated
            ? (token ?? undefined)
            : undefined;
      try {
        setIsLoading(true);
        setError(null);
        const config = await getFacesConfig(effectiveToken);
        if (generation !== loadGenerationRef.current) return config;
        setAllFaces(config);
        logger.info('Faces config loaded', {
          faceCount: config.length,
          isAuthenticated: Boolean(effectiveToken),
        });
        return config;
      } catch (err) {
        if (generation !== loadGenerationRef.current) return [];
        logger.error('Failed to load faces config', { error: err });
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return [];
      } finally {
        if (generation === loadGenerationRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, token]
  );

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadConfig();
    })();
  }, [loadConfig]);

  useEffect(() => {
    if (!isAuthenticated || !token || profileLastFaceApplied) return;
    let cancelled = false;
    void (async () => {
      try {
        const profile = await profileApi.getProfile(token);
        if (cancelled) return;
        if (profile.lastSelectedFaceId != null) {
          setSelectedFaceId(profile.lastSelectedFaceId);
        }
      } catch {
        // best-effort — URL / first available face still applies
      } finally {
        if (!cancelled) setProfileLastFaceApplied(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, profileLastFaceApplied]);

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
          const config = await getFacesConfig(token);
          setAllFaces(config);
        } catch {
          // Face switch still applies locally; visit sync is best-effort
        }
      })();
    },
    [token]
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
      reload: loadConfig,
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
      loadConfig,
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
