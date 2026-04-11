import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { buildLocalizedNavigateTarget } from '../utils/buildLocalizedNavigatePath';
import type { SupportedLanguage } from '../i18n/constants';

/**
 * Imperative navigation with **`/{lang}/...`** prefix derived from the current route (`lang` param) or
 * `AppContext` fallback. Does **not** translate route segments — callers pass already-canonical paths
 * (e.g. `profile/edit`). Uses React Router `navigate` under the hood; `replace` forwards to RR options.
 */
export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { currentLanguage } = useApp();

  const localizedNavigate = (path: string, options?: { replace?: boolean }) => {
    const target = buildLocalizedNavigateTarget(path, lang, currentLanguage as SupportedLanguage);
    navigate(target, options);
  };

  return localizedNavigate;
}
