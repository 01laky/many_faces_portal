/**
 * Axios URL rewriting helpers (`faceApiRouting.ts`) must mirror **be_demo** `RoutingMiddleware`:
 * guest sessions embed the active face segment before `/api/...` while admin/public prefixes stay stable.
 *
 * **Window mock:** some helpers read `window.location.pathname`; tests stub `globalThis.window` when absent
 * and reset axios interceptors between cases so order-dependent assertions stay isolated.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  extractFacePathFromPathname,
  prependFaceBeforeApi,
  getEffectiveFacePrefix,
  applyFacePrefixToRequestUrl,
  scopePathForCurrentFace,
  absoluteScopedUrl,
  resetLangLevelStaticRouteSegmentsCache,
} from '../faceApiRouting';
import { initI18n } from '../../i18n/config';

const mockWindow = {
  location: {
    pathname: '/',
    href: 'http://localhost/',
  },
} as any;

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = mockWindow;
}

function mockWindowLocation(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: {
      pathname,
      href: `http://localhost${pathname}`,
    },
    writable: true,
    configurable: true,
  });
}

function restoreWindowLocation() {
  delete (window as any).location;
}

describe('Face Path Routing', () => {
  beforeAll(async () => {
    await initI18n();
    resetLangLevelStaticRouteSegmentsCache();
  });

  beforeEach(() => {
    axios.interceptors.request.clear();
    resetLangLevelStaticRouteSegmentsCache();
  });

  afterEach(() => {
    axios.interceptors.request.clear();
    restoreWindowLocation();
  });

  describe('extractFacePathFromPathname', () => {
    it('returns null for /en only', () => {
      expect(extractFacePathFromPathname('/en')).toBeNull();
    });

    it('returns public for /en/public/home (second segment is face)', () => {
      expect(extractFacePathFromPathname('/en/public/home')).toBe('public');
    });

    it('returns null for /en/login (static route before redirect)', () => {
      expect(extractFacePathFromPathname('/en/login')).toBeNull();
    });

    it('returns acme-corp when first segment is not a language', () => {
      expect(extractFacePathFromPathname('/acme-corp/dashboard')).toBe('acme-corp');
    });

    it('returns face from /acme-corp/en/login', () => {
      expect(extractFacePathFromPathname('/acme-corp/en/login')).toBe('acme-corp');
    });

    it('treats path with double slash after lang as having face segment', () => {
      expect(extractFacePathFromPathname('/en//public/home')).toBe('public');
    });
  });

  describe('prependFaceBeforeApi', () => {
    it('does not change URL when face path is unused (caller passes face)', () => {
      expect(prependFaceBeforeApi('/api/users', 'acme-corp')).toBe('/acme-corp/api/users');
    });

    it('does not double-prefix /public/api/users', () => {
      expect(prependFaceBeforeApi('/public/api/users', 'public')).toBe('/public/api/users');
    });

    it('leaves /api/oauth2/token', () => {
      expect(prependFaceBeforeApi('/api/oauth2/token', 'public')).toBe('/api/oauth2/token');
    });

    it('leaves /api/auth/login', () => {
      expect(prependFaceBeforeApi('/api/auth/login', 'acme-corp')).toBe('/api/auth/login');
    });
  });

  describe('getEffectiveFacePrefix + applyFacePrefixToRequestUrl', () => {
    const apiBase = 'https://localhost:8001';

    it('rewrites full URL to /public/api/... when pathname has no face', () => {
      mockWindowLocation('/en');
      const face = getEffectiveFacePrefix(window.location.pathname, 'public');
      expect(face).toBe('public');
      const out = applyFacePrefixToRequestUrl(
        `${apiBase}/api/faces/config`,
        face,
        apiBase
      );
      expect(out).toBe(`${apiBase}/public/api/faces/config`);
    });

    it('rewrites with tenant face from URL', () => {
      mockWindowLocation('/en/acme-corp/home');
      const face = getEffectiveFacePrefix(window.location.pathname, 'public');
      expect(face).toBe('acme-corp');
      const out = applyFacePrefixToRequestUrl(`${apiBase}/api/Users`, face, apiBase);
      expect(out).toBe(`${apiBase}/acme-corp/api/Users`);
    });
  });

  describe('ACL /api/me/capabilities URL shape', () => {
    it('scopePathForCurrentFace uses default face on static route path', () => {
      mockWindowLocation('/en/login');
      expect(scopePathForCurrentFace('/api/me/capabilities')).toMatch(/\/public\/api\/me\/capabilities$/);
    });

    it('scopePathForCurrentFace uses tenant face from pathname', () => {
      mockWindowLocation('/en/acme-corp/home');
      expect(scopePathForCurrentFace('/api/me/capabilities')).toBe('/acme-corp/api/me/capabilities');
    });

    it('absoluteScopedUrl prepends apiUrl and face segment', () => {
      mockWindowLocation('/en/login');
      const u = absoluteScopedUrl('/api/me/capabilities');
      expect(u).toContain('/public/api/me/capabilities');
      expect(u.startsWith('http')).toBe(true);
    });

    it('does not double-prefix when path already has face api segment', () => {
      mockWindowLocation('/en/public/home');
      const scoped = scopePathForCurrentFace('/public/api/me/capabilities');
      expect(scoped).toBe('/public/api/me/capabilities');
    });
  });

});
