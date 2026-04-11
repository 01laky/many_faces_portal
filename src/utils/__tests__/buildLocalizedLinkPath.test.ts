/**
 * Table-driven checks for guest vs authenticated localized URLs — documents how `selectedFace.index`
 * (numeric or string slug) participates in path construction without mounting React.
 */
import { describe, it, expect, vi } from 'vitest';
import { buildLocalizedLinkPath } from '../buildLocalizedLinkPath';
import { supportedLanguages } from '../../i18n/config';

describe('buildLocalizedLinkPath', () => {
  const mockT = vi.fn((key: string) => {
    const map: Record<string, string> = {
      'routes.login': 'login',
      'routes.register': 'register',
    };
    return map[key] ?? key;
  });

  it('guest + public face prefixes face index before path segment', () => {
    const result = buildLocalizedLinkPath({
      path: 'login',
      targetLang: 'en',
      isAuthenticated: false,
      selectedFace: { index: 2 },
      translate: mockT,
    });
    expect(result).toBe('/en/2/login');
  });

  it('authenticated user has no face segment', () => {
    const result = buildLocalizedLinkPath({
      path: 'login',
      targetLang: 'sk',
      isAuthenticated: true,
      selectedFace: { index: 2 },
      translate: mockT,
    });
    expect(result).toBe('/sk/login');
  });

  it('guest without selectedFace omits face index', () => {
    const result = buildLocalizedLinkPath({
      path: 'register',
      targetLang: 'cz',
      isAuthenticated: false,
      selectedFace: undefined,
      translate: mockT,
    });
    expect(result).toBe('/cz/register');
  });

  it('strips leading slash on input path', () => {
    expect(
      buildLocalizedLinkPath({
        path: '/login',
        targetLang: 'en',
        isAuthenticated: true,
        selectedFace: null,
        translate: mockT,
      })
    ).toBe('/en/login');
  });

  it('empty path yields language root only', () => {
    expect(
      buildLocalizedLinkPath({
        path: '',
        targetLang: 'en',
        isAuthenticated: false,
        selectedFace: { index: 1 },
        translate: mockT,
      })
    ).toBe('/en');
  });

  it('supports every supported language code (edge: static list vs face ambiguity)', () => {
    for (const lang of supportedLanguages) {
      const out = buildLocalizedLinkPath({
        path: 'login',
        targetLang: lang,
        isAuthenticated: true,
        selectedFace: undefined,
        translate: mockT,
      });
      expect(out.startsWith(`/${lang}/`)).toBe(true);
    }
  });
});
