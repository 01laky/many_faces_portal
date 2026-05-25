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
import { setAuthToken } from '../api/config';
import { logger } from '../utils/logger';
import { isTokenExpired } from '../utils/jwtUtils';
import { jwtUserFromToken, type PortalJwtUser } from '../utils/jwtUserFromToken';
import { getAccessTokenFromStorage } from '../utils/authStorage';
import { setupAuthStorageSync } from '../utils/authSessionSync';
import { resetPortalAuthSession } from '../utils/portalAuthSession';
import { runLegacyLocalStorageMigration } from '../utils/legacyStorageMigration';
import * as profileApi from '../api/profile/profileApi';
import { ensureLanguageLoaded } from '../i18n/config';
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
 * Session / expiry — intentional layering (see performance prompt §2.8):
 * - **React Query `useAuthToken`**: canonical token read + cache; `readAuthTokenQueryValue` clears storage when expired.
 * - **Bootstrap `localStorage` + `useEffect` sync**: hydrates UI before Query resolves; must stay aligned with Query on login/logout.
 * - **`setInterval` + `isTokenExpired`**: safety net when JWT expires without a failing API call; **paused while tab hidden** to reduce wakeups.
 * - **Axios `401` → `auth:unauthorized`**: clears session when the backend rejects the token (network path).
 * Logout UX may fire from any layer; keep behavior consistent (toast + redirect handled by listeners/pages).
 */

type User = PortalJwtUser;

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	/** True after the one-shot cold-start session read completes; stays true during login/logout. */
	isSessionHydrated: boolean;
	user: User | null;
	token: string | null;
	login: (
		username: string,
		password: string,
		options?: { rememberMe?: boolean }
	) => Promise<string | undefined>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function MeCapabilitiesWarmup({ token }: { token: string | null }) {
	useMeCapabilities(token, Boolean(token));
	return null;
}

function clearAuthReactState(
	setToken: (t: string | null) => void,
	setIsAuthenticated: (v: boolean) => void,
	setUser: (u: User | null) => void
): void {
	setToken(null);
	setIsAuthenticated(false);
	setUser(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSessionHydrated, setIsSessionHydrated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const { t, i18n } = useTranslation('common');
	const queryClient = useQueryClient();
	const legacyMigrationRan = useRef(false);

	const loginMutation = useLoginMutation();
	const logoutMutation = useLogoutMutation();
	const refreshTokenMutation = useRefreshTokenMutation();
	const { data: tokenData, isLoading: tokenLoading } = useAuthToken();

	const clearSession = useCallback(() => {
		resetPortalAuthSession();
		setAuthToken(null);
		clearAuthReactState(setToken, setIsAuthenticated, setUser);
	}, []);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			try {
				const storedToken = getAccessTokenFromStorage();
				if (storedToken && !isTokenExpired(storedToken)) {
					setToken(storedToken);
					setAuthToken(storedToken);
					setIsAuthenticated(true);
					setUser(jwtUserFromToken(storedToken));
				} else if (storedToken && isTokenExpired(storedToken)) {
					resetPortalAuthSession();
					queryClient.removeQueries({ queryKey: authKeys.all });
				}
			} catch (error) {
				logger.error('Failed to load auth state', error);
			} finally {
				setIsSessionHydrated(true);
				setIsLoading(false);
			}
		})();
	}, [queryClient]);

	useEffect(() => {
		if (legacyMigrationRan.current || !token || !isAuthenticated) return;
		legacyMigrationRan.current = true;
		void (async () => {
			await runLegacyLocalStorageMigration(localStorage, sessionStorage, {
				onMigrateGuestLanguage: async (lang) => {
					await profileApi.updateProfile(token, { preferredUiLanguage: lang });
				},
				onMigrateLastFaceId: async (faceId) => {
					await profileApi.updateProfile(token, { lastSelectedFaceId: faceId });
				},
			});
			try {
				const profile = await profileApi.getProfile(token);
				if (profile.preferredUiLanguage) {
					await ensureLanguageLoaded(profile.preferredUiLanguage);
					await i18n.changeLanguage(profile.preferredUiLanguage);
				}
			} catch {
				// profile fetch is best-effort on bootstrap
			}
		})();
	}, [token, isAuthenticated, i18n]);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			if (tokenData?.accessToken) {
				setToken(tokenData.accessToken);
				setAuthToken(tokenData.accessToken);
				setIsAuthenticated(true);
				setUser(jwtUserFromToken(tokenData.accessToken));
			} else if (!tokenLoading && !tokenData) {
				clearAuthReactState(setToken, setIsAuthenticated, setUser);
				setAuthToken(null);
			}
		})();
	}, [tokenData, tokenLoading]);

	useEffect(() => {
		const handler = () => {
			clearSession();
			toast.info(
				t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
			);
		};
		window.addEventListener('auth:unauthorized', handler);
		return () => window.removeEventListener('auth:unauthorized', handler);
	}, [t, clearSession]);

	useEffect(() => {
		const onRefreshed = (event: Event) => {
			const detail = (event as CustomEvent<{ accessToken?: string }>).detail;
			if (!detail?.accessToken) return;
			setToken(detail.accessToken);
			setAuthToken(detail.accessToken);
			setIsAuthenticated(true);
			setUser(jwtUserFromToken(detail.accessToken));
		};
		window.addEventListener('auth:token-refreshed', onRefreshed);
		return () => window.removeEventListener('auth:token-refreshed', onRefreshed);
	}, []);

	useEffect(() => {
		return setupAuthStorageSync(() => {
			clearSession();
			toast.info(
				t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
			);
		});
	}, [clearSession, t]);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	useEffect(() => {
		if (!token || !isAuthenticated) return;

		const checkExpiry = () => {
			if (token && isTokenExpired(token)) {
				clearSession();
				toast.info(
					t('pages.logout.sessionExpired') || 'Your session has expired. Please log in again.'
				);
			}
		};

		const clearTimer = () => {
			if (intervalRef.current != null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};

		const startTimer = () => {
			clearTimer();
			intervalRef.current = setInterval(checkExpiry, 30_000);
		};

		const onVisibility = () => {
			if (typeof document === 'undefined') return;
			if (document.visibilityState === 'hidden') {
				clearTimer();
			} else {
				checkExpiry();
				startTimer();
			}
		};

		checkExpiry();
		startTimer();
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			clearTimer();
		};
	}, [token, isAuthenticated, t, clearSession]);

	const login = useCallback(
		async (username: string, password: string, options?: { rememberMe?: boolean }) => {
			try {
				setIsLoading(true);
				logger.info('Attempting login', { username });

				const result = await loginMutation.mutateAsync({
					username,
					password,
					rememberMe: options?.rememberMe,
				});

				if (result?.accessToken) {
					setToken(result.accessToken);
					setAuthToken(result.accessToken);
					setIsAuthenticated(true);
					setUser(
						jwtUserFromToken(result.accessToken, username) ?? { id: username, email: username }
					);
					logger.info('Login successful', { username });
					return result.accessToken;
				}
				return undefined;
			} catch (error) {
				logger.error('Login failed', error);
				clearSession();
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[loginMutation, clearSession]
	);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);
			logger.info('Logging out');
			await logoutMutation.mutateAsync();
			clearSession();
			logger.info('Logout successful');
			toast.success(t('pages.logout.successMessage') || 'Logged out successfully');
		} catch (error) {
			logger.error('Logout failed', error);
			clearSession();
			const errorMessage =
				error instanceof Error ? error.message : t('pages.logout.errorMessage') || 'Logout failed';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [logoutMutation, t, clearSession]);

	const refreshAuth = useCallback(async () => {
		try {
			const result = await refreshTokenMutation.mutateAsync();
			if (result?.accessToken) {
				setToken(result.accessToken);
				setAuthToken(result.accessToken);
				setIsAuthenticated(true);
				setUser(jwtUserFromToken(result.accessToken));
				logger.info('Token refreshed successfully');
			}
		} catch (error) {
			logger.error('Token refresh failed', error);
			await logout();
		}
	}, [refreshTokenMutation, logout]);

	const authValue = useMemo(
		(): AuthContextType => ({
			isAuthenticated,
			isLoading,
			isSessionHydrated,
			user,
			token,
			login,
			logout,
			refreshAuth,
		}),
		[isAuthenticated, isLoading, isSessionHydrated, user, token, login, logout, refreshAuth]
	);

	return (
		<AuthContext.Provider value={authValue}>
			<MeCapabilitiesWarmup token={token} />
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
