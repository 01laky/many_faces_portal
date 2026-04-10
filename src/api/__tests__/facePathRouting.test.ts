/**
 * Tests for face-prefixed API URLs (/ {face} /api/...) aligned with backend RoutingMiddleware.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  extractFacePathFromPathname,
  prependFaceBeforeApi,
  getEffectiveFacePrefix,
  applyFacePrefixToRequestUrl,
} from '../faceApiRouting';

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
  beforeEach(() => {
    axios.interceptors.request.clear();
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

});
