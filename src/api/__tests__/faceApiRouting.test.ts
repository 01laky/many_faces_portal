import { describe, expect, it } from 'vitest';
import {
  applyFacePrefixToRequestUrl,
  isApiPathExemptFromFacePrefix,
  prependFaceBeforeApi,
} from '../faceApiRouting';

describe('isApiPathExemptFromFacePrefix', () => {
  it('exempts account-wide profile and my-content routes', () => {
    expect(isApiPathExemptFromFacePrefix('/api/profile/me')).toBe(true);
    expect(isApiPathExemptFromFacePrefix('/api/profile/me?faceId=1')).toBe(true);
    expect(isApiPathExemptFromFacePrefix('/api/my/content-submissions')).toBe(true);
  });

  it('does not exempt face-scoped content APIs', () => {
    expect(isApiPathExemptFromFacePrefix('/api/blogs/1')).toBe(false);
  });
});

describe('profile API URLs stay global', () => {
  const base = 'http://localhost:8081';

  it('does not prepend face prefix to PUT /api/profile/me', () => {
    const url = applyFacePrefixToRequestUrl(`${base}/api/profile/me`, 'demo', base);
    expect(url).toBe(`${base}/api/profile/me`);
  });

  it('still prepends face prefix to blogs API', () => {
    expect(prependFaceBeforeApi('/api/blogs/1', 'demo')).toBe('/demo/api/blogs/1');
  });
});
