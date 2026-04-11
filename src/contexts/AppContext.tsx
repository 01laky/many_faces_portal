import { createContext, useContext, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n/constants';
import { ensureLanguageLoaded } from '../i18n/config';

interface AppContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation('common');

  const currentLanguage = (i18n.language as SupportedLanguage) || 'en';

  const changeLanguage = useCallback(
    async (newLang: SupportedLanguage) => {
      await ensureLanguageLoaded(newLang);
      await i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
    },
    [i18n]
  );

  const value = useMemo(
    () => ({
      currentLanguage,
      changeLanguage,
      t,
    }),
    [currentLanguage, changeLanguage, t]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { supportedLanguages };
