import type { OAuth2TokenRequest } from '../../api';

/**
 * Builds the JSON body for POST /api/oauth2/token (password grant).
 *
 * - `rememberMe` is only meaningful when strictly `true`; anything else becomes `false` in the payload
 *   so the API issues the short session (Jwt:ExpiresInMinutes), not the long-lived token.
 * - Matches backend: `RememberMe == true` selects Jwt:ExpiresInMinutesRememberMe.
 */
export function buildPasswordGrantTokenRequest(params: {
	username: string;
	password: string;
	rememberMe?: boolean;
	clientId: string;
	clientSecret: string;
}): OAuth2TokenRequest {
	return {
		grantType: 'password',
		username: params.username,
		password: params.password,
		rememberMe: params.rememberMe === true,
		clientId: params.clientId,
		clientSecret: params.clientSecret,
	};
}
