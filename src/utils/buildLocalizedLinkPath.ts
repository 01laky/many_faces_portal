import type { SupportedLanguage } from '../i18n/constants';
import { getTranslatedRoute } from './routeTranslations';

export type LocalizedLinkTranslate = (key: string) => string;

/**
 * Pure URL builder for guest vs authenticated localized paths.
 *
 * **Guests** browsing a public face see URLs prefixed with that face's `index` (slug or numeric id from API),
 * so deep links stay scoped to the face context. **Authenticated** users use the simpler `/{lang}/...` layout
 * because the app resolves the active face server-side / via session instead of encoding it in every link.
 *
 * `selectedFace.index` is `string | number` because OpenAPI models historically exposed either slug or id;
 * both stringify safely into the path segment.
 *
 * Kept free of React so `useLocalizedLink` and Vitest can share one implementation.
 */
export function buildLocalizedLinkPath(params: {
  path: string;
  targetLang: SupportedLanguage;
  isAuthenticated: boolean;
  selectedFace: { index: string | number } | null | undefined;
  translate: LocalizedLinkTranslate;
}): string {
  const { path, targetLang, isAuthenticated, selectedFace, translate } = params;

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const translatedPath = getTranslatedRoute(cleanPath, targetLang, translate);
  const pathSegment = translatedPath || cleanPath;

  if (!isAuthenticated && selectedFace && pathSegment) {
    // Face-scoped guest URL: /{lang}/{faceIndex}/{page}
    return `/${targetLang}/${selectedFace.index}/${pathSegment}`;
  }
  return `/${targetLang}${pathSegment ? `/${pathSegment}` : ''}`;
}
