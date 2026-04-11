import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { buildLocalizedLinkPath } from '../utils/buildLocalizedLinkPath';
import type { SupportedLanguage } from '../i18n/constants';

/**
 * Returns **`getLocalizedPath(path)`** for `<Link to={...}>` / anchors: combines route language, i18n route
 * translation (`common` namespace keys consumed by `getTranslatedRoute`), and **guest face scoping**.
 *
 * **Why a hook:** needs `useParams().lang`, auth + face contexts, and `useTranslation` for the active `lng`.
 * **Why not `navigate`:** use `useLocalizedNavigate` for imperative router moves — this helper only builds strings.
 */
export function useLocalizedLink() {
  const { lang } = useParams<{ lang: string }>();
  const { currentLanguage } = useApp();
  const { t: i18nT } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const { selectedFace } = useFaceConfig();

  /** Memo-free factory: delegates to pure `buildLocalizedLinkPath` for testability. */
  const getLocalizedPath = (path: string): string => {
    const targetLang = (lang as SupportedLanguage) || currentLanguage;
    return buildLocalizedLinkPath({
      path,
      targetLang,
      isAuthenticated,
      selectedFace,
      translate: (key: string) => i18nT(key, { lng: targetLang }),
    });
  };

  return getLocalizedPath;
}
