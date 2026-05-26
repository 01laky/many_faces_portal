export type { AuthWebStorage } from '@/utils/authStorage';
export { AUTH_STORAGE_KEYS } from '@/utils/authStorage';

/** Normalizes token payloads from `/api/oauth2/token` (codegen may surface `accessToken` or legacy `token`). */
export interface TokenResponse {
	accessToken?: string;
	refreshToken?: string;
	token?: string;
}
