import { useAuth } from '../contexts/AuthContext';

export interface AppBootstrapError {
  message: string;
}

export interface AppBootstrapState {
  isReady: boolean;
  isBlocking: boolean;
  error: AppBootstrapError | null;
  flags: {
    i18nReady: boolean;
    authSessionReady: boolean;
    faceConfigReady: boolean;
  };
}

export interface UseAppBootstrapReadyOptions {
  faceConfig?: {
    isLoading: boolean;
    error: Error | null;
  };
}

/** Aggregates mandatory cold-start flags for the global preloader gate. */
export function useAppBootstrapReady(options: UseAppBootstrapReadyOptions = {}): AppBootstrapState {
  const { faceConfig } = options;
  const { isSessionHydrated } = useAuth();

  const authSessionReady = isSessionHydrated;
  const requireFaceConfig = faceConfig !== undefined;
  const faceConfigReady = requireFaceConfig ? faceConfig.isLoading === false : true;
  const bootstrapError =
    requireFaceConfig && faceConfig.error ? { message: faceConfig.error.message } : null;

  const isReady = authSessionReady && faceConfigReady && bootstrapError === null;

  return {
    isReady,
    isBlocking: !isReady,
    error: bootstrapError,
    flags: {
      i18nReady: true,
      authSessionReady,
      faceConfigReady,
    },
  };
}
