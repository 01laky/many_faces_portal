import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { logger } from '../../utils/logger';
import { meCapabilitiesKeys } from './useMeCapabilities';
import {
	registerUser,
	runPasswordGrantLogin,
	readAuthTokenQueryValue,
	clearLocalAuthSession,
	runRefreshGrantLogin,
} from './authSessionActions';

/**
 * Auth React Query façade: thin wrappers around `authSessionActions` so components never touch OpenAPI
 * clients or storage keys directly.
 *
 * - **Login / refresh** persist tokens via `runPasswordGrantLogin` / `runRefreshGrantLogin` and warm
 *   `authKeys.token` cache + invalidate `meCapabilitiesKeys` so ACL-gated routes refetch after identity change.
 * - **`useAuthToken`** polls storage (`staleTime`) and calls `readAuthTokenQueryValue`, which strips expired
 *   JWTs client-side to avoid request storms with `401` while the UI still thinks the user is signed in.
 * - **`clearAuthAndCapabilitiesQueries`** is the hard reset used on refresh failure / logout so React Query
 *   cannot resurrect a dead session from in-memory caches (security hardening §13 / §18).
 */

/** React Query key factory for everything under the auth domain (user + token subkeys). */
export const authKeys = {
	all: ['auth'] as const,
	user: () => [...authKeys.all, 'user'] as const,
	token: () => [...authKeys.all, 'token'] as const,
};

/**
 * Drops cached auth + capabilities after refresh failure so the UI cannot loop on a dead session.
 * Same keys as logout success — security-hardening prompt §13 / §18 (FE).
 */
export function clearAuthAndCapabilitiesQueries(queryClient: QueryClient): void {
	queryClient.removeQueries({ queryKey: authKeys.all });
	queryClient.removeQueries({ queryKey: meCapabilitiesKeys.all });
}

/**
 * Hook for user registration
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			logger.info('User registered successfully');
		},
		onError: (error) => {
			logger.error('Registration failed', error);
		},
	});
}

/**
 * Hook for user login (OAuth2 token request)
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (credentials: { username: string; password: string; rememberMe?: boolean }) =>
			runPasswordGrantLogin(credentials),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.token(), data);
			queryClient.invalidateQueries({ queryKey: authKeys.user() });
			queryClient.invalidateQueries({ queryKey: meCapabilitiesKeys.all });
			logger.info('Login successful');
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : 'Login failed';
			logger.error('Login failed', { error: errorMessage, originalError: error });
		},
	});
}

/**
 * Hook to get current auth token
 */
export function useAuthToken() {
	return useQuery({
		queryKey: authKeys.token(),
		queryFn: () => readAuthTokenQueryValue(),
		/** Periodic re-read so JWT expiry or storage changes in another tab converge without full page reload. */
		staleTime: 60_000,
		/** Cap in-memory retention for long sessions (default query `gcTime` also applies). */
		gcTime: 10 * 60_000,
	});
}

/**
 * Hook for logout
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			clearLocalAuthSession();
		},
		onSuccess: () => {
			clearAuthAndCapabilitiesQueries(queryClient);
		},
	});
}

/**
 * Hook for refreshing auth token
 */
export function useRefreshToken() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => runRefreshGrantLogin(),
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.token(), data);
			queryClient.invalidateQueries({ queryKey: meCapabilitiesKeys.all });
			logger.info('Token refreshed successfully');
		},
		onError: (error) => {
			logger.error('Token refresh failed', error);
			clearAuthAndCapabilitiesQueries(queryClient);
		},
	});
}
