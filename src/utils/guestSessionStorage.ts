import { supportedLanguages, type SupportedLanguage } from '../i18n/constants';
import {
	GRADIENT_ANIMATION_STORAGE_KEY,
	readGuestGradientAnimationEnabled,
	writeGuestGradientAnimationEnabled,
} from './gradientAnimationPreferenceStorage';

const GUEST_LOCALE_KEY = 'mfai.guestUiLanguage';

export type WebStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function resolveSessionStorage(session?: WebStorageLike): WebStorageLike | null {
	if (session !== undefined) return session;
	if (typeof sessionStorage === 'undefined') return null;
	return sessionStorage;
}

export function readGuestUiLanguage(session?: WebStorageLike): SupportedLanguage | null {
	const store = resolveSessionStorage(session);
	if (!store) return null;
	const stored = store.getItem(GUEST_LOCALE_KEY);
	if (stored && supportedLanguages.includes(stored as SupportedLanguage)) {
		return stored as SupportedLanguage;
	}
	return null;
}

export function writeGuestUiLanguage(lang: SupportedLanguage, session?: WebStorageLike): void {
	const store = resolveSessionStorage(session);
	if (!store) return;
	store.setItem(GUEST_LOCALE_KEY, lang);
}

export function migrateGuestGradientToSession(
	local?: WebStorageLike,
	session?: WebStorageLike
): void {
	const localStore = local ?? (typeof localStorage !== 'undefined' ? localStorage : null);
	const sessionStore = resolveSessionStorage(session);
	if (!localStore || !sessionStore) return;
	const legacy = localStore.getItem(GRADIENT_ANIMATION_STORAGE_KEY);
	if (legacy == null) return;
	sessionStore.setItem(GRADIENT_ANIMATION_STORAGE_KEY, legacy);
	localStore.removeItem(GRADIENT_ANIMATION_STORAGE_KEY);
}

export {
	readGuestGradientAnimationEnabled,
	writeGuestGradientAnimationEnabled,
	GRADIENT_ANIMATION_STORAGE_KEY,
};
