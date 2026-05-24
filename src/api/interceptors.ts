/**
 * Portal axios response interceptors — 401 refresh with single-flight queue (PSH1-A1).
 * Terminal failure dispatches `auth:unauthorized` for AuthContext (no hard redirect here).
 */

import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { OpenAPI } from './core/OpenAPI';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
	clearAuthStorage,
	getRefreshTokenFromStorage,
	persistAccessToken,
	persistRefreshToken,
} from '../utils/authStorage';
import { setAuthToken } from './config';
import {
	isOAuthTokenEndpoint,
	isRateLimitResponse,
	shouldHandle401Refresh,
} from './interceptorPolicy';

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve(token!);
	});
	failedQueue = [];
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

function forceLogout() {
	logger.warn('Token refresh failed – forcing logout');
	clearAuthStorage();
	setAuthToken(null);
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('auth:unauthorized'));
	}
}

function notifyTokenRefreshed(accessToken: string) {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent('auth:token-refreshed', { detail: { accessToken } })
		);
	}
}

/** Register global axios response interceptor (call once after configureApiClient). */
export function setupAxiosInterceptors() {
	axios.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config as RetryableRequestConfig | undefined;
			if (!originalRequest) return Promise.reject(error);

			if (
				isRateLimitResponse(error.response?.status, error.response?.data) &&
				isOAuthTokenEndpoint(originalRequest.url)
			) {
				const rateLimitError = new Error(
					'Too many authentication attempts. Please wait a moment and try again.'
				);
				rateLimitError.name = 'RateLimitError';
				return Promise.reject(rateLimitError);
			}

			if (!shouldHandle401Refresh(error.response?.status, originalRequest)) {
				return Promise.reject(error);
			}

			if (isRefreshing) {
				return new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((newToken) => {
					originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
					return axios(originalRequest as AxiosRequestConfig);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = getRefreshTokenFromStorage();
			if (!refreshToken) {
				isRefreshing = false;
				processQueue(error);
				forceLogout();
				return Promise.reject(error);
			}

			try {
				const response = await axios.post(
					`${OpenAPI.BASE}/api/oauth2/token`,
					{
						grantType: 'refresh_token',
						refreshToken,
						clientId: env.oauth2ClientId,
						clientSecret: env.oauth2ClientSecret,
					},
					{ headers: { 'Content-Type': 'application/json' } }
				);

				const tokenData = response.data as {
					accessToken?: string;
					token?: string;
					refreshToken?: string;
				};
				const newAccessToken = tokenData?.accessToken ?? tokenData?.token;
				if (!newAccessToken) throw new Error('No access token in refresh response');

				persistAccessToken(newAccessToken);
				if (tokenData.refreshToken) persistRefreshToken(tokenData.refreshToken);
				logger.info('Token refreshed via interceptor');
				notifyTokenRefreshed(newAccessToken);
				processQueue(null, newAccessToken);

				originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
				return axios(originalRequest as AxiosRequestConfig);
			} catch (refreshError) {
				processQueue(refreshError);
				const axiosRefreshErr = refreshError as AxiosError | undefined;
				if (
					isRateLimitResponse(
						axiosRefreshErr?.response?.status,
						axiosRefreshErr?.response?.data
					)
				) {
					return Promise.reject(refreshError);
				}
				forceLogout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
	);
}
