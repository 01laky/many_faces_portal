import { getAccessTokenFromStorage } from '../../utils/authStorage';

/**
 * Fetch wrapper that dispatches auth:unauthorized on 401 when user had a token.
 * Used by services that use fetch directly (Friends, Messages, etc.).
 */
export async function authAwareFetch(
  url: string,
  options: RequestInit & { token?: string }
): Promise<Response> {
  const token = options.token;
  const { token: _, ...fetchOptions } = options;
  const res = await fetch(url, fetchOptions);
  if (res.status === 401 && token && getAccessTokenFromStorage()) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
  return res;
}
