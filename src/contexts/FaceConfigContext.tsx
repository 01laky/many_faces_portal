import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getFacesConfig } from '../api/config/getFacesConfig';
import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'selected_face_id';

interface FaceConfigContextType {
  /** All faces from backend */
  allFaces: FacesConfigResponse;
  /** Public faces (visible without auth) */
  publicFaces: FaceConfig[];
  /** Private faces (visible only when authenticated) */
  privateFaces: FaceConfig[];
  /** Faces available to current user based on auth state */
  availableFaces: FaceConfig[];
  /** Currently selected face (null if none) */
  selectedFace: FaceConfig | null;
  /** Select a face by id */
  selectFace: (faceId: number) => void;
  /** Whether config is loading */
  isLoading: boolean;
  /** Config load error */
  error: Error | null;
  /** Reload config from backend */
  reload: () => Promise<void>;
  /** Get the home page path for the selected face (e.g., "/basic/home") */
  getFaceHomePath: () => string;
}

const FaceConfigContext = createContext<FaceConfigContextType | undefined>(undefined);

export function FaceConfigProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [allFaces, setAllFaces] = useState<FacesConfigResponse>([]);
  const [selectedFaceId, setSelectedFaceId] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const config = await getFacesConfig();
      setAllFaces(config);
      logger.info('Faces config loaded', {
        faceCount: config.length,
        isAuthenticated,
      });
    } catch (err) {
      logger.error('Failed to load faces config', { error: err });
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const publicFaces = useMemo(() => allFaces.filter((f) => f.isPublic), [allFaces]);

  const privateFaces = useMemo(() => allFaces.filter((f) => !f.isPublic), [allFaces]);

  // Available faces depend on auth state
  const availableFaces = useMemo(
    () => (isAuthenticated ? privateFaces : publicFaces),
    [isAuthenticated, publicFaces, privateFaces]
  );

  // Auto-select first available face when available faces change or stored id is invalid
  const selectedFace = useMemo(() => {
    if (availableFaces.length === 0) return null;
    const found = availableFaces.find((f) => f.id === selectedFaceId);
    if (found) return found;
    // Fallback to first available
    return availableFaces[0];
  }, [availableFaces, selectedFaceId]);

  const selectFace = useCallback((faceId: number) => {
    setSelectedFaceId(faceId);
    localStorage.setItem(STORAGE_KEY, String(faceId));
  }, []);

  // Sync selected face id to storage when auto-corrected
  useEffect(() => {
    if (selectedFace && selectedFace.id !== selectedFaceId) {
      setSelectedFaceId(selectedFace.id);
      localStorage.setItem(STORAGE_KEY, String(selectedFace.id));
    }
  }, [selectedFace, selectedFaceId]);

  // Build the face home path from the selected face's "home" page type
  const getFaceHomePath = useCallback((): string => {
    if (!selectedFace) return '/homepage';
    const homePage = selectedFace.pages.find((p) => p.pageType.index === 'home');
    if (!homePage) return '/homepage';
    const pagePath = homePage.path.startsWith('/') ? homePage.path.slice(1) : homePage.path;
    return `/${selectedFace.index}/${pagePath}`;
  }, [selectedFace]);

  return (
    <FaceConfigContext.Provider
      value={{
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
      }}
    >
      {children}
    </FaceConfigContext.Provider>
  );
}

export function useFaceConfig() {
  const context = useContext(FaceConfigContext);
  if (context === undefined) {
    throw new Error('useFaceConfig must be used within a FaceConfigProvider');
  }
  return context;
}
