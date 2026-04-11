/**
 * i18n runtime — async initialization so only the active locale JSON is in the initial chunk.
 * Call `initI18n()` once from `main.tsx` before `createRoot().render()`.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from './constants';

export { supportedLanguages, type SupportedLanguage } from './constants';

function readStoredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem('i18nextLng');
  if (stored && supportedLanguages.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  return null;
}

function readNavigatorLanguage(): SupportedLanguage | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator.language?.slice(0, 2);
  if (nav && supportedLanguages.includes(nav as SupportedLanguage)) {
    return nav as SupportedLanguage;
  }
  return null;
}

function readHtmlLang(): SupportedLanguage | null {
  if (typeof document === 'undefined' || !document.documentElement) return null;
  const tag = document.documentElement.lang?.slice(0, 2);
  if (tag && supportedLanguages.includes(tag as SupportedLanguage)) {
    return tag as SupportedLanguage;
  }
  return null;
}

/** Same priority as former `i18next-browser-languagedetector` order (without running the plugin twice). */
function pickInitialLanguage(): SupportedLanguage {
  return readStoredLanguage() ?? readNavigatorLanguage() ?? readHtmlLang() ?? 'en';
}

let initPromise: Promise<void> | null = null;

export async function ensureLanguageLoaded(lng: SupportedLanguage): Promise<void> {
  if (!i18n.isInitialized) {
    await initI18n();
  }
  if (!i18n.hasResourceBundle(lng, 'common')) {
    const common = (await import(`./locales/${lng}.json`)).default;
    i18n.addResourceBundle(lng, 'common', common, true, true);
  }
}

export function initI18n(): Promise<void> {
  if (i18n.isInitialized) {
    return Promise.resolve();
  }
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    const lng = pickInitialLanguage();
    const common = (await import(`./locales/${lng}.json`)).default;
    await i18n.use(initReactI18next).init({
      lng,
      fallbackLng: 'en',
      supportedLngs: [...supportedLanguages],
      defaultNS: 'common',
      ns: ['common'],
      resources: {
        [lng]: { common },
      },
      partialBundledLanguages: true,
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
    });
  })();
  return initPromise;
}

export default i18n;
