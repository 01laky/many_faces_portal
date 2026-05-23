/**
 * Email-code registration API (two-step flow).
 * Uses bare `/api/oauth2/register/*` paths (face-prefix exempt), not generated OpenAPI client.
 */
import { env } from '../config/env';
import { setAuthToken } from './config';
import { persistAccessToken, persistRefreshToken } from '../utils/authStorage';

/** OAuth2 token payload returned by `POST …/register/complete` (extends standard token response). */
export interface RegisterCompleteTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
}

function oauthBase(): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return `${base}/api/oauth2/register`;
}

/**
 * Step 1: request signup email with verification code + link.
 * Backend always returns success shape when HTTP 200 (no email enumeration).
 */
export async function postRegisterRequest(body: {
  email: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
}): Promise<void> {
  const res = await fetch(`${oauthBase()}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Registration request failed');
  }
}

/**
 * Step 2 (prefill): load email/names for UI; `valid` false when invite expired or unknown hash.
 */
export async function getRegisterPrefill(hash: string): Promise<{
  email: string;
  firstName?: string;
  lastName?: string;
  valid: boolean;
}> {
  const res = await fetch(`${oauthBase()}/prefill?hash=${encodeURIComponent(hash)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Invalid registration link');
  }
  return res.json();
}

/**
 * Step 2 (submit): verify hash+code, create account, receive OAuth tokens for auto-login.
 */
export async function postRegisterComplete(body: {
  hash: string;
  code: string;
  password: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: boolean;
}): Promise<RegisterCompleteTokenResponse> {
  const res = await fetch(`${oauthBase()}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...body,
      clientId: env.oauth2ClientId,
      clientSecret: env.oauth2ClientSecret,
    }),
  });
  if (!res.ok) {
    throw new Error('Registration complete failed');
  }
  return res.json();
}

/** Persist tokens like login so subsequent API calls use the new session immediately. */
export function persistTokensFromRegistration(tokens: RegisterCompleteTokenResponse): void {
  persistAccessToken(tokens.accessToken, localStorage, setAuthToken);
  if (tokens.refreshToken) {
    persistRefreshToken(tokens.refreshToken, localStorage);
  }
}
