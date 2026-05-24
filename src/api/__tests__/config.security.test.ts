import { describe, expect, it, vi } from 'vitest';
import { assertNoMixedContentApi, invalidateMemoizedFacePrefixCache } from '../config';
import { applyFacePrefixToRequestUrl } from '../faceApiRouting';

describe('configureApiClient helpers (PSH1-T-E03, PSH1-T-B11)', () => {
  it('PSH1-T-E03: blocks https page + http api', () => {
    expect(() => assertNoMixedContentApi('http://localhost:8000', 'https:')).toThrow(
      /Mixed content/
    );
  });

  it('allows https page + https api', () => {
    expect(() => assertNoMixedContentApi('https://localhost:8001', 'https:')).not.toThrow();
  });

  it('PSH1-T-B11: face prefix cache invalidation picks up new pathname', () => {
    const base = 'https://localhost:8001';
    vi.stubGlobal('window', {
      location: { pathname: '/en/acme/home' },
    });
    invalidateMemoizedFacePrefixCache();
    expect(applyFacePrefixToRequestUrl('/api/stories', 'acme', base)).toBe('/acme/api/stories');

    window.location.pathname = '/en/beta/home';
    invalidateMemoizedFacePrefixCache();
    expect(applyFacePrefixToRequestUrl('/api/stories', 'beta', base)).toBe('/beta/api/stories');
    vi.unstubAllGlobals();
  });
});
