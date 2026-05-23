import type { SupportedLanguage } from '../i18n/constants';
import { supportedLanguages } from '../i18n/constants';

// Map of English route names to their keys in i18n
const routeKeys: Record<string, string> = {
  login: 'routes.login',
  register: 'routes.register',
  homepage: 'routes.homepage',
  chat: 'routes.chat',
  profile: 'routes.profile',
  users: 'routes.users',
};

// Map of route keys to English route names (reverse lookup)
const routeKeyToEnglish: Record<string, string> = {
  'routes.login': 'login',
  'routes.register': 'register',
  'routes.homepage': 'homepage',
  'routes.chat': 'chat',
  'routes.profile': 'profile',
  'routes.users': 'users',
};

/**
 * Get translated route path for a given language
 * @param englishPath - English route path (e.g., 'login', 'register')
 * @param language - Target language
 * @param t - Translation function from i18next
 * @returns Translated route path
 */
export function getTranslatedRoute(
  englishPath: string,
  _language: SupportedLanguage,
  t: (key: string) => string
): string {
  // If path is empty or root, return empty
  if (!englishPath || englishPath === '/') {
    return '';
  }

  // Remove leading slash if present
  const cleanPath = englishPath.startsWith('/') ? englishPath.slice(1) : englishPath;

  // Split path into segments
  const segments = cleanPath.split('/');

  // Translate each segment
  const translatedSegments = segments.map((segment) => {
    const routeKey = routeKeys[segment];
    if (routeKey) {
      return t(routeKey);
    }
    // If no translation found, return original segment
    return segment;
  });

  return translatedSegments.join('/');
}

/**
 * Get English route path from translated path
 * @param translatedPath - Translated route path (e.g., 'prihlasenie', 'registracia')
 * @param language - Current language
 * @param t - Translation function from i18next
 * @returns English route path
 */
export function getEnglishRoute(
  translatedPath: string,
  _language: SupportedLanguage,
  t: (key: string) => string
): string {
  // If path is empty or root, return empty
  if (!translatedPath || translatedPath === '/') {
    return '';
  }

  // Remove leading slash if present
  const cleanPath = translatedPath.startsWith('/') ? translatedPath.slice(1) : translatedPath;

  // Split path into segments
  const segments = cleanPath.split('/');

  // Find English route for each segment
  const englishSegments = segments.map((segment) => {
    // Try to find which route key matches this translated segment
    for (const [routeKey, englishRoute] of Object.entries(routeKeyToEnglish)) {
      const translated = t(routeKey);
      if (translated === segment) {
        return englishRoute;
      }
    }
    // If no match found, return original segment
    return segment;
  });

  return englishSegments.join('/');
}

/**
 * Get all possible route translations for a given English route
 * Used for route matching
 */
export function getAllRouteTranslations(
  englishRoute: string,
  t: (key: string, options?: { lng?: string }) => string
): string[] {
  const routeKey = routeKeys[englishRoute];
  if (!routeKey) {
    return [englishRoute];
  }

  const translations: string[] = [englishRoute];

  supportedLanguages.forEach((lang) => {
    const translated = t(routeKey, { lng: lang });
    if (
      typeof translated === 'string' &&
      translated.length > 0 &&
      translated !== englishRoute &&
      !translations.includes(translated)
    ) {
      translations.push(translated);
    }
  });

  return translations;
}
