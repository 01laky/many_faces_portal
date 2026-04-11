import type { SupportedLanguage } from '../i18n/constants';

/**
 * Builds an **internal** router target `/{lang}/{path}` for imperative navigation (`navigate(...)`) where
 * the caller already resolved the logical route and only needs the active language segment injected.
 *
 * Unlike `buildLocalizedLinkPath`, this **does not** translate route keys nor insert guest face prefixes —
 * those concerns stay in link builders / `react-router` configuration to avoid double-processing.
 */
export function buildLocalizedNavigateTarget(
  path: string,
  lang: string | undefined,
  currentLanguage: SupportedLanguage
): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const targetLang = (lang as SupportedLanguage) || currentLanguage;
  return `/${targetLang}/${cleanPath}`;
}
