import { describe, expect, it } from 'vitest';
import {
  applyFacePrefixToRequestUrl,
  getEffectiveFacePrefix,
  isApiPathExemptFromFacePrefix,
  pathAlreadyHasFaceApiPrefix,
  prependFaceBeforeApi,
  prependFaceBeforeHubs,
} from '../faceApiRouting';

const BASE = 'https://localhost:8001';
const FACE = 'acme';

describe('faceApiRouting (PSH1-T-B01…B10)', () => {
  it('PSH1-T-B01: /api/stories → /acme/api/stories', () => {
    expect(prependFaceBeforeApi('/api/stories', FACE)).toBe('/acme/api/stories');
  });

  it('PSH1-T-B02: /api/oauth2/token not prefixed', () => {
    expect(isApiPathExemptFromFacePrefix('/api/oauth2/token')).toBe(true);
    expect(prependFaceBeforeApi('/api/oauth2/token', FACE)).toBe('/api/oauth2/token');
  });

  it('PSH1-T-B03: /api/profile/settings not prefixed', () => {
    expect(isApiPathExemptFromFacePrefix('/api/profile/settings')).toBe(true);
    expect(prependFaceBeforeApi('/api/profile/settings', FACE)).toBe('/api/profile/settings');
  });

  it('PSH1-T-B04: /api/my/albums not prefixed', () => {
    expect(isApiPathExemptFromFacePrefix('/api/my/albums')).toBe(true);
    expect(prependFaceBeforeApi('/api/my/albums', FACE)).toBe('/api/my/albums');
  });

  it('PSH1-T-B05: /hubs/messenger → /acme/hubs/messenger', () => {
    expect(prependFaceBeforeHubs('/hubs/messenger', FACE)).toBe('/acme/hubs/messenger');
  });

  it('PSH1-T-B06: already /acme/api/... not double-prefixed', () => {
    expect(pathAlreadyHasFaceApiPrefix('/acme/api/stories')).toBe(true);
    expect(prependFaceBeforeApi('/acme/api/stories', FACE)).toBe('/acme/api/stories');
  });

  it('PSH1-T-B07: query string preserved', () => {
    expect(prependFaceBeforeApi('/api/stories?page=2', FACE)).toBe('/acme/api/stories?page=2');
  });

  it('PSH1-T-B08: static login route has no face segment → default prefix', () => {
    expect(getEffectiveFacePrefix('/en/login', 'public')).toBe('public');
  });

  it('PSH1-T-B09: localization path exempt from face prefix', () => {
    expect(isApiPathExemptFromFacePrefix('/api/localization/portal')).toBe(true);
    expect(prependFaceBeforeApi('/api/localization/portal', FACE)).toBe('/api/localization/portal');
  });

  it('PSH1-T-B10: capabilities URL rewritten at runtime', () => {
    expect(applyFacePrefixToRequestUrl('/api/me/capabilities', FACE, BASE)).toBe(
      '/acme/api/me/capabilities'
    );
    expect(applyFacePrefixToRequestUrl(`${BASE}/api/me/capabilities`, FACE, BASE)).toBe(
      `${BASE}/acme/api/me/capabilities`
    );
  });
});
