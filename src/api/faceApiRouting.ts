/**
 * Aligns browser API calls with backend RoutingMiddleware: requests must use /{face-prefix}/api/...
 * (OAuth stays at /api/oauth2/...).
 */

import { env } from '../config/env';
import { supportedLanguages } from '../i18n/constants';
import { getAllRouteTranslations } from '../utils/routeTranslations';
import i18n from '../i18n/config';

const ROUTES_WHERE_SECOND_SEGMENT_IS_NOT_FACE = [
  'login',
  'register',
  'homepage',
  'profile',
  'users',
  'chat',
] as const;

let cachedLangLevelStaticSegments: Set<string> | null = null;

/** Call after `initI18n()` so static route segments reflect loaded bundles (tests may reset between cases). */
export function resetLangLevelStaticRouteSegmentsCache(): void {
  cachedLangLevelStaticSegments = null;
}

function langLevelStaticRouteSegments(): Set<string> {
  if (cachedLangLevelStaticSegments) return cachedLangLevelStaticSegments;
  const set = new Set<string>();
  const t = (key: string, options?: { lng?: string }) => i18n.t(key, options);
  for (const r of ROUTES_WHERE_SECOND_SEGMENT_IS_NOT_FACE) {
    for (const path of getAllRouteTranslations(r, t)) {
      const seg = path.split('/').filter(Boolean)[0];
      if (seg) set.add(seg.toLowerCase());
    }
  }
  cachedLangLevelStaticSegments = set;
  return set;
}

/**
 * Face segment from the SPA path. App routes are /:lang/:faceIndex/... or /:lang/:staticPage before redirect.
 */
export function extractFacePathFromPathname(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const langSet = new Set(supportedLanguages.map((l) => l.toLowerCase()));
  const first = parts[0]!.toLowerCase();

  if (langSet.has(first)) {
    if (parts.length < 2) return null;
    const second = parts[1]!;
    if (langLevelStaticRouteSegments().has(second.toLowerCase())) return null;
    return second;
  }

  return parts[0]!;
}

export function getEffectiveFacePrefix(pathname: string, defaultFacePrefix: string): string {
  return extractFacePathFromPathname(pathname) ?? defaultFacePrefix;
}

/**
 * Account-wide API routes that must stay at `/api/...` (not `/{face}/api/...`).
 * Profile and "my content" are user-scoped, not face-scoped — rewriting them breaks PUT/GET and
 * triggers the global axios 401 handler (session cleared while toggling settings).
 */
export function isApiPathExemptFromFacePrefix(absPath: string): boolean {
  const p = absPath.split('?')[0].toLowerCase();
  return (
    p.startsWith('/api/oauth2') ||
    p.startsWith('/api/auth') ||
    p.startsWith('/api/localization') ||
    p.startsWith('/api/profile') ||
    p.startsWith('/api/my/')
  );
}

/** True when path already matches /{segment}/api/... */
export function pathAlreadyHasFaceApiPrefix(absPath: string): boolean {
  const p = absPath.split('?')[0];
  return /^\/[^/]+\/api(\/|$)/i.test(p);
}

/**
 * Turn /api/foo → /{face}/api/foo. Leaves /api/oauth2 and /api/auth unchanged.
 */
export function prependFaceBeforeApi(absPath: string, facePrefix: string): string {
  const qIdx = absPath.indexOf('?');
  const pathPart = qIdx >= 0 ? absPath.slice(0, qIdx) : absPath;
  const query = qIdx >= 0 ? absPath.slice(qIdx) : '';

  if (!pathPart.startsWith('/api/') && pathPart !== '/api') return absPath;
  if (isApiPathExemptFromFacePrefix(pathPart)) return absPath;
  if (pathAlreadyHasFaceApiPrefix(pathPart)) return absPath;

  const afterApi = pathPart === '/api' ? '' : pathPart.slice('/api'.length);
  return `/${facePrefix}/api${afterApi}${query}`;
}

/** Same as API: /hubs/foo → /{face}/hubs/foo (RoutingMiddleware). */
export function prependFaceBeforeHubs(absPath: string, facePrefix: string): string {
  const qIdx = absPath.indexOf('?');
  const pathPart = qIdx >= 0 ? absPath.slice(0, qIdx) : absPath;
  const query = qIdx >= 0 ? absPath.slice(qIdx) : '';

  if (!pathPart.startsWith('/hubs/') && pathPart !== '/hubs') return absPath;
  if (/^\/[^/]+\/hubs(\/|$)/i.test(pathPart)) return absPath;

  const after = pathPart === '/hubs' ? '' : pathPart.slice('/hubs'.length);
  return `/${facePrefix}/hubs${after}${query}`;
}

function prependFaceScopeToRelativePath(rel: string, facePrefix: string): string {
  const withApi = prependFaceBeforeApi(rel, facePrefix);
  if (withApi !== rel) return withApi;
  return prependFaceBeforeHubs(rel, facePrefix);
}

export function applyFacePrefixToRequestUrl(url: string, facePrefix: string, apiBaseUrl: string): string {
  const base = apiBaseUrl.replace(/\/$/, '');
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (!url.startsWith(base)) return url;
    const rest = url.slice(base.length);
    const rel = rest.startsWith('/') ? rest : `/${rest}`;
    return base + prependFaceScopeToRelativePath(rel, facePrefix);
  }
  return prependFaceScopeToRelativePath(url, facePrefix);
}

/** Path starting with /api/... or /hubs/... → scoped segment; other paths unchanged. */
export function scopePathForCurrentFace(path: string): string {
  const face =
    typeof window !== 'undefined'
      ? getEffectiveFacePrefix(window.location.pathname, env.defaultFacePrefix)
      : env.defaultFacePrefix;
  const rel = path.startsWith('/') ? path : `/${path}`;
  const withApi = prependFaceBeforeApi(rel, face);
  if (withApi !== rel) return withApi;
  return prependFaceBeforeHubs(rel, face);
}

export function absoluteScopedUrl(path: string): string {
  return `${env.apiUrl.replace(/\/$/, '')}${scopePathForCurrentFace(path)}`;
}
