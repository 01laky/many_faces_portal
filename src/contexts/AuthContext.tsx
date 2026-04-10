import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken } from '../api/config';
import { logger } from '../utils/logger';
import { isTokenExpired } from '../utils/jwtUtils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useLogin as useLoginMutation,
  useLogout as useLogoutMutation,
  useAuthToken,
  useRefreshToken as useRefreshTokenMutation,
} from '../hooks/api/useAuthApi';
import { authKeys } from '../hooks/api/useAuthApi';
import { useMeCapabilities } from '../hooks/api/useMeCapabilities';

/**
 * User information interface
 */
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Authentication context type
 */
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;

  // Actions
  login: (username: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Prefetch GET /api/me/capabilities when a JWT is present (face-prefixed base URL). */
function MeCapabilitiesWarmup({ token }: { token: string | null }) {
  useMeCapabilities(token, Boolean(token));
  return null;
}

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

/**
 * Authentication Provider component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  // React Query hooks
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const refreshTokenMutation = useRefreshTokenMutation();
  const { data: tokenData, isLoading: tokenLoading } = useAuthToken();

  /**
   * Load authentication state from localStorage on mount
   * Clears token if expired - no point showing user as "logged in" with invalid session
   */
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          setAuthToken(storedToken);
          setIsAuthenticated(true);

          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              logger.warn('Failed to parse stored user data', { error: String(e) });
            }
          }
        } else if (storedToken && isTokenExpired(storedToken)) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setAuthToken(null);
          queryClient.removeQueries({ queryKey: authKeys.all });
        }
      } catch (error) {
        logger.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, [queryClient]);

  // Sync token from React Query
  useEffect(() => {
    if (tokenData?.accessToken) {
      setToken(tokenData.accessToken);
      setAuthToken(tokenData.accessToken);
      setIsAuthenticated(true);
    } else if (!tokenLoading && !tokenData) {
      setToken(null);
      setAuthToken(null);
      setIsAuthenticated(false);
    }
  }, [tokenData, tokenLoading]);

  // Listen for 401 (expired token) from API - auto logout (clear local state only, skip backend)
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setAuthToken(null);
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      toast.info(
        t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
      );
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [t]);

  // Session watcher: periodically check token expiry and auto-logout (no API request needed)
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const checkExpiry = () => {
      if (token && isTokenExpired(token)) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setAuthToken(null);
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        toast.info(
          t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
        );
      }
    };

    const interval = setInterval(checkExpiry, 30_000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [token, isAuthenticated, t]);

  /**
   * Login function - uses React Query mutation
   */
  const login = useCallback(
    async (username: string, password: string, options?: { rememberMe?: boolean }) => {
      try {
        setIsLoading(true);
        logger.info('Attempting login', { username });

        // Use React Query mutation
        // rememberMe forwarded as optional; hook coerces to boolean for API (see buildPasswordGrantTokenRequest).
        const result = await loginMutation.mutateAsync({
          username,
          password,
          rememberMe: options?.rememberMe,
        });

        if (result?.accessToken) {
          setToken(result.accessToken);
          setAuthToken(result.accessToken);
          setIsAuthenticated(true);

          // Extract user info from token (basic JWT decode)
          try {
            const payload = JSON.parse(atob(result.accessToken.split('.')[1]));
            const userData: User = {
              id: payload.sub || payload.nameid || '',
              email: payload.email || username,
              firstName: payload.given_name || payload.firstName,
              lastName: payload.family_name || payload.lastName,
            };
            setUser(userData);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          } catch (e) {
            logger.warn('Failed to decode token, using username as email', { error: String(e) });
            const userData: User = {
              id: username,
              email: username,
            };
            setUser(userData);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          }

          logger.info('Login successful', { username });
          // Toast will be shown in LoginPage component
        }
      } catch (error) {
        logger.error('Login failed', error);
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        setAuthToken(null);

        // Toast will be shown in LoginPage component
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation]
  );

  /**
   * Logout function - uses React Query mutation
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      logger.info('Logging out');

      // Use React Query mutation
      await logoutMutation.mutateAsync();

      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Clear local state
      setAuthToken(null);
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);

      logger.info('Logout successful');
      toast.success(t('pages.logout.successMessage') || 'Logged out successfully');
    } catch (error) {
      logger.error('Logout failed', error);

      // Clear state even if API call fails
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setAuthToken(null);
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);

      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : t('pages.logout.errorMessage') || 'Logout failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [logoutMutation, t]);

  /**
   * Refresh authentication token - uses React Query mutation
   */
  const refreshAuth = useCallback(async () => {
    try {
      const result = await refreshTokenMutation.mutateAsync();

      if (result?.accessToken) {
        setToken(result.accessToken);
        setAuthToken(result.accessToken);
        setIsAuthenticated(true);
        logger.info('Token refreshed successfully');
      }
    } catch (error) {
      logger.error('Token refresh failed', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [refreshTokenMutation, logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        refreshAuth,
      }}
    >
      <MeCapabilitiesWarmup token={token} />
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
