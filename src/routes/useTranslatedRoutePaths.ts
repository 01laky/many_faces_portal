import { useCallback, useMemo } from 'react';
import type { i18n } from 'i18next';
import { getAllRouteTranslations } from '../utils/routeTranslations';

/** Memoized translated path lists for static routes under `/:lang`. */
export function useTranslatedRoutePaths(i18n: i18n) {
  const translateKey = useCallback(
    (key: string, options?: { lng?: string }) => i18n.t(key, { lng: options?.lng || 'en' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `i18n.language` must invalidate when locale changes.
    [i18n, i18n.language]
  );

  const loginPaths = useMemo(() => getAllRouteTranslations('login', translateKey), [translateKey]);
  const registerPaths = useMemo(
    () => getAllRouteTranslations('register', translateKey),
    [translateKey]
  );
  const homepagePaths = useMemo(
    () => getAllRouteTranslations('homepage', translateKey),
    [translateKey]
  );
  const profilePaths = useMemo(
    () => getAllRouteTranslations('profile', translateKey),
    [translateKey]
  );
  const usersPaths = useMemo(() => getAllRouteTranslations('users', translateKey), [translateKey]);

  return { loginPaths, registerPaths, homepagePaths, profilePaths, usersPaths };
}
