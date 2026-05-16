import { describe, expect, it } from 'vitest';
import type { FaceConfig } from '../../api/types/facesConfig';
import { pathnameMatchesWallPage } from '../faceWallPage';

function faceWithWall(path = '/wall', translations: string[] = []): FaceConfig {
  return {
    index: 'basic',
    id: 1,
    title: 'Basic',
    isPublic: true,
    pages: [
      {
        index: 1,
        id: 10,
        name: 'Wall',
        path,
        pageType: { id: 2, index: 'wall' },
        routeTranslations: translations.map((tr, i) => ({
          languageCode: `l${i}`,
          translatedRoute: tr,
        })),
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
  };
}

describe('pathnameMatchesWallPage', () => {
  it('returns false when face is null', () => {
    expect(pathnameMatchesWallPage('/en/basic/wall', null)).toBe(false);
  });

  it('returns false when path has fewer than three segments', () => {
    expect(pathnameMatchesWallPage('/en/basic', faceWithWall())).toBe(false);
  });

  it('returns false when face segment does not match selected face', () => {
    expect(pathnameMatchesWallPage('/en/other/wall', faceWithWall())).toBe(false);
  });

  it('matches default wall path case-insensitively', () => {
    const face = faceWithWall('/wall');
    expect(pathnameMatchesWallPage('/en/Basic/wall', face)).toBe(true);
    expect(pathnameMatchesWallPage('/en/basic/wall/extra', face)).toBe(true);
  });

  it('matches translated wall route', () => {
    const face = faceWithWall('/wall', ['stenka']);
    expect(pathnameMatchesWallPage('/sk/basic/stenka', face)).toBe(true);
  });

  it('returns false for non-wall page types', () => {
    const face: FaceConfig = {
      ...faceWithWall(),
      pages: [
        {
          index: 1,
          id: 10,
          name: 'Home',
          path: '/home',
          pageType: { id: 1, index: 'home' },
          routeTranslations: [],
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
    };
    expect(pathnameMatchesWallPage('/en/basic/home', face)).toBe(false);
  });
});
