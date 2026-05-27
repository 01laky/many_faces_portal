/**
 * i18n runtime — bundles loaded from GET /api/localization/portal before render.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from './constants';
import { fetchLocalizationBundle } from './fetchLocalizationBundle';
import { readGuestUiLanguage } from '../utils/guestSessionStorage';

export { supportedLanguages, type SupportedLanguage } from './constants';

function readStoredLanguage(): SupportedLanguage | null {
	return readGuestUiLanguage();
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

function pickInitialLanguage(): SupportedLanguage {
	return readStoredLanguage() ?? readNavigatorLanguage() ?? readHtmlLang() ?? 'en';
}

let initPromise: Promise<void> | null = null;
let bundleLoaded = false;
let cachedBundle: Awaited<ReturnType<typeof fetchLocalizationBundle>> | null = null;

/** Register active language plus `en` fallback only (PT-RP18). */
function addActiveLanguageBundles(
	bundle: Awaited<ReturnType<typeof fetchLocalizationBundle>>,
	activeLang: SupportedLanguage
): void {
	const langsToLoad = new Set<SupportedLanguage>([activeLang, 'en']);
	for (const lang of langsToLoad) {
		const nsMap = bundle.resources[lang];
		if (!nsMap) continue;
		for (const [ns, data] of Object.entries(nsMap)) {
			if (!i18n.hasResourceBundle(lang, ns)) {
				i18n.addResourceBundle(lang, ns, data, true, true);
			}
		}
	}
}

export async function ensureLanguageLoaded(lng: SupportedLanguage): Promise<void> {
	if (!i18n.isInitialized) {
		await initI18n();
		return;
	}
	if (!i18n.hasResourceBundle(lng, 'common') && cachedBundle) {
		addActiveLanguageBundles(cachedBundle, lng);
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
		const bundle = await fetchLocalizationBundle('portal');
		cachedBundle = bundle;

		await i18n.use(initReactI18next).init({
			lng,
			fallbackLng: 'en',
			supportedLngs: [...supportedLanguages],
			defaultNS: 'common',
			ns: ['common'],
			resources: {},
			partialBundledLanguages: true,
			react: { useSuspense: false },
			interpolation: { escapeValue: false },
		});

		addActiveLanguageBundles(bundle, lng);
		bundleLoaded = true;
	})();
	return initPromise;
}

export function isLocalizationBundleLoaded(): boolean {
	return bundleLoaded;
}

export default i18n;
