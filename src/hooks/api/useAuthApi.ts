import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService, OAuth2Service, ApiError } from '../../api';
import type { OAuth2TokenRequest, RegisterModel } from '../../api';
import { setAuthToken } from '../../api/config';
import { logger } from '../../utils/logger';
import { isTokenExpired } from '../../utils/jwtUtils';
import { env } from '../../config/env';
import { buildPasswordGrantTokenRequest } from './authTokenRequest';

/**
 * Auth React Query layer: login sends password grant + optional rememberMe (longer access token TTL on API).
 * Token query re-reads localStorage and drops expired JWTs so UI matches API reality.
 */

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  token: () => [...authKeys.all, 'token'] as const,
};

// Token response type
interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterModel) => {
      logger.info('Registering user', { email: data.email });
      const response = await AuthService.postApiAuthRegister({
        requestBody: data,
      });
      return response;
    },
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
    mutationFn: async (credentials: {
      username: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      logger.info('Attempting login', { username: credentials.username });

      const tokenRequest = buildPasswordGrantTokenRequest({
        username: credentials.username,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
        clientId: env.oauth2ClientId,
        clientSecret: env.oauth2ClientSecret,
      });

      let response;
      try {
        response = await OAuth2Service.postApiOauth2Token({
          requestBody: tokenRequest,
        });
      } catch (error) {
        // Handle API errors
        if (error instanceof ApiError) {
          const errorMessage =
            error.body?.errorDescription ||
            error.body?.error ||
            error.body?.message ||
            error.message ||
            'Login failed';
          throw new Error(errorMessage);
        }
        throw error;
      }

      // Parse response
      const tokenData = response as unknown as TokenResponse;
      const accessToken =
        tokenData.accessToken || (tokenData as unknown as { token?: string }).token;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Store token in API client
      setAuthToken(accessToken);

      // Store in localStorage
      localStorage.setItem('auth_token', accessToken);
      if (tokenData.refreshToken) {
        localStorage.setItem('auth_refresh_token', tokenData.refreshToken);
      }

      return {
        accessToken,
        refreshToken: tokenData.refreshToken,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.token(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
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
    queryFn: () => {
      const token = localStorage.getItem('auth_token');
      // Expired token: clear all auth keys so hooks and axios interceptor see logged-out state.
      if (!token || isTokenExpired(token)) {
        if (token) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user');
          setAuthToken(null);
        }
        return null;
      }
      setAuthToken(token);
      return { accessToken: token };
    },
    staleTime: 60_000, // Re-check every minute to detect expiry
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear token from API client
      setAuthToken(null);

      // Clear from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');

      logger.info('User logged out');
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook for refreshing auth token
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('auth_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      logger.info('Refreshing token');

      const tokenRequest: OAuth2TokenRequest = {
        grantType: 'refresh_token',
        refreshToken,
        clientId: env.oauth2ClientId,
        clientSecret: env.oauth2ClientSecret,
      };

      const response = await OAuth2Service.postApiOauth2Token({
        requestBody: tokenRequest,
      });

      const tokenData = response as unknown as TokenResponse;
      const accessToken =
        tokenData.accessToken || (tokenData as unknown as { token?: string }).token;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Store token in API client
      setAuthToken(accessToken);

      // Store in localStorage
      localStorage.setItem('auth_token', accessToken);
      if (tokenData.refreshToken) {
        localStorage.setItem('auth_refresh_token', tokenData.refreshToken);
      }

      return {
        accessToken,
        refreshToken: tokenData.refreshToken,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.token(), data);
      logger.info('Token refreshed successfully');
    },
    onError: (error) => {
      logger.error('Token refresh failed', error);
      // Clear auth state on refresh failure
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}
