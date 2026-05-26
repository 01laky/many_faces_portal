/**
 * Integration-style unit tests for `authSessionActions`: mocks OpenAPI services + `axios` config to assert
 * storage side effects, `ApiError` → `Error` mapping, and refresh/login flows without a browser.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../utils/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}));
import type { ApiRequestOptions } from '../../../api/core/ApiRequestOptions';
import type { ApiResult } from '../../../api/core/ApiResult';
import { ApiError, AuthService, OAuth2Service } from '../../../api';
import * as apiConfig from '../../../api/config';
import {
	registerUser,
	runPasswordGrantLogin,
	readAuthTokenQueryValue,
	clearLocalAuthSession,
	runRefreshGrantLogin,
} from '@/hooks/api/authSessionActions';
import { authKeys } from '@/hooks/api/useAuthApi';

function makeApiError(body: Record<string, unknown>): ApiError {
	const response: ApiResult = {
		url: 'http://test/token',
		ok: false,
		status: 400,
		statusText: 'Bad Request',
		body,
	};
	return new ApiError({} as ApiRequestOptions, response, 'error');
}

function memoryStorage(): Storage {
	const m = new Map<string, string>();
	return {
		getItem: (k) => m.get(k) ?? null,
		setItem: (k, v) => {
			m.set(k, v);
		},
		removeItem: (k) => {
			m.delete(k);
		},
		clear: () => m.clear(),
		get length() {
			return m.size;
		},
		key: () => null,
	} as Storage;
}

describe('authSessionActions', () => {
	beforeEach(() => {
		vi.spyOn(apiConfig, 'setAuthToken').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('registerUser calls AuthService', async () => {
		vi.spyOn(AuthService, 'postApiAuthRegister').mockResolvedValue({ id: 1 } as never);
		const out = await registerUser({ email: 'a@b.c', password: 'p' });
		expect(out).toEqual({ id: 1 });
		expect(AuthService.postApiAuthRegister).toHaveBeenCalledWith({
			requestBody: { email: 'a@b.c', password: 'p' },
		});
	});

	it('runPasswordGrantLogin persists tokens', async () => {
		vi.spyOn(OAuth2Service, 'postApiOauth2Token').mockResolvedValue({
			accessToken: 'a',
			refreshToken: 'r',
		} as never);
		const storage = memoryStorage();

		const result = await runPasswordGrantLogin(
			{ username: 'u', password: 'p', rememberMe: false },
			storage
		);

		expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
		expect(storage.getItem('auth_token')).toBe('a');
		expect(storage.getItem('auth_refresh_token')).toBe('r');
		expect(apiConfig.setAuthToken).toHaveBeenCalledWith('a');
	});

	it('runPasswordGrantLogin maps ApiError', async () => {
		vi.spyOn(OAuth2Service, 'postApiOauth2Token').mockRejectedValue(
			makeApiError({ errorDescription: 'Bad' })
		);
		await expect(
			runPasswordGrantLogin({ username: 'u', password: 'p' }, memoryStorage())
		).rejects.toThrow('Bad');
	});

	it('runPasswordGrantLogin throws when no access token', async () => {
		vi.spyOn(OAuth2Service, 'postApiOauth2Token').mockResolvedValue({} as never);
		await expect(
			runPasswordGrantLogin({ username: 'u', password: 'p' }, memoryStorage())
		).rejects.toThrow('No access token received from server');
	});

	it('readAuthTokenQueryValue returns null and clears when expired', () => {
		const storage = memoryStorage();
		storage.setItem('auth_token', 'x.y.z');
		storage.setItem('auth_refresh_token', 'r');
		storage.setItem('auth_user', '{}');
		const expired = vi.fn().mockReturnValue(true);

		const out = readAuthTokenQueryValue(storage, expired, apiConfig.setAuthToken);

		expect(out).toBeNull();
		expect(storage.getItem('auth_token')).toBeNull();
		expect(storage.getItem('auth_refresh_token')).toBeNull();
		expect(storage.getItem('auth_user')).toBe('{}');
		expect(apiConfig.setAuthToken).toHaveBeenCalledWith(null);
	});

	it('readAuthTokenQueryValue applies token when valid', () => {
		const storage = memoryStorage();
		storage.setItem('auth_token', 'valid');
		const ok = vi.fn().mockReturnValue(false);

		const out = readAuthTokenQueryValue(storage, ok, apiConfig.setAuthToken);

		expect(out).toEqual({ accessToken: 'valid' });
		expect(apiConfig.setAuthToken).toHaveBeenCalledWith('valid');
	});

	it('clearLocalAuthSession removes token keys only', () => {
		const storage = memoryStorage();
		storage.setItem('auth_token', 't');
		storage.setItem('auth_refresh_token', 'r');
		storage.setItem('auth_user', '{}');

		clearLocalAuthSession(storage, apiConfig.setAuthToken);

		expect(storage.getItem('auth_token')).toBeNull();
		expect(storage.getItem('auth_refresh_token')).toBeNull();
		expect(storage.getItem('auth_user')).toBe('{}');
		expect(apiConfig.setAuthToken).toHaveBeenCalledWith(null);
	});

	it('runRefreshGrantLogin throws without refresh token', async () => {
		const storage = memoryStorage();
		await expect(runRefreshGrantLogin(storage)).rejects.toThrow('No refresh token available');
	});

	it('runRefreshGrantLogin updates storage on success', async () => {
		const storage = memoryStorage();
		storage.setItem('auth_refresh_token', 'ref');
		vi.spyOn(OAuth2Service, 'postApiOauth2Token').mockResolvedValue({
			accessToken: 'new',
			refreshToken: 'ref2',
		} as never);

		const out = await runRefreshGrantLogin(storage);

		expect(out.accessToken).toBe('new');
		expect(storage.getItem('auth_token')).toBe('new');
		expect(storage.getItem('auth_refresh_token')).toBe('ref2');
	});
});

describe('useAuthApi authKeys', () => {
	it('token and user key shapes are stable', () => {
		expect(authKeys.token()).toEqual(['auth', 'token']);
		expect(authKeys.user()).toEqual(['auth', 'user']);
	});
});
