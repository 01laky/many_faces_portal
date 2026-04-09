/**
 * Returns true when the JWT should be treated as unusable for session purposes.
 *
 * - Uses standard `exp` (seconds since epoch). If `exp` is missing, the token is treated as **not** expired
 *   (some tokens may omit it; API in this project always sets exp).
 * - Malformed tokens (wrong segments, invalid base64/JSON) → expired, so callers clear storage and force re-login.
 */
export function isTokenExpired(jwt: string): boolean {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    if (!exp) return false;
    // exp is in seconds; Date.now() is ms
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
