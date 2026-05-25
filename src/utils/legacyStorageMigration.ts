import { supportedLanguages, type SupportedLanguage } from '../i18n/constants';
import { LEGACY_AUTH_USER_KEY } from './authStorage';
import { migrateGuestGradientToSession } from './guestSessionStorage';

const LEGACY_I18N_KEY = 'i18nextLng';
const LEGACY_FACE_KEY = 'selected_face_id';
const LEGACY_COMPONENT_PREFIX = 'component-settings-';

export type WebStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export type LegacyMigrationCallbacks = {
	onMigrateGuestLanguage?: (lang: SupportedLanguage) => void | Promise<void>;
	onMigrateLastFaceId?: (faceId: number) => void | Promise<void>;
};

/** One-time idempotent cleanup of deprecated localStorage keys. */
export async function runLegacyLocalStorageMigration(
	storage?: WebStorageLike,
	session?: WebStorageLike,
	callbacks: LegacyMigrationCallbacks = {}
): Promise<void> {
	const localStore = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
	if (!localStore) return;

	localStore.removeItem(LEGACY_AUTH_USER_KEY);

	const legacyLang = localStore.getItem(LEGACY_I18N_KEY);
	if (legacyLang && supportedLanguages.includes(legacyLang as SupportedLanguage)) {
		if (callbacks.onMigrateGuestLanguage) {
			await callbacks.onMigrateGuestLanguage(legacyLang as SupportedLanguage);
		}
		localStore.removeItem(LEGACY_I18N_KEY);
	}

	migrateGuestGradientToSession(localStore, session);

	const legacyFace = localStore.getItem(LEGACY_FACE_KEY);
	if (legacyFace) {
		if (callbacks.onMigrateLastFaceId) {
			const faceId = parseInt(legacyFace, 10);
			if (!Number.isNaN(faceId)) await callbacks.onMigrateLastFaceId(faceId);
		}
		localStore.removeItem(LEGACY_FACE_KEY);
	}

	if (typeof localStore.key === 'function') {
		const toRemove: string[] = [];
		for (let i = 0; i < localStore.length; i++) {
			const k = localStore.key(i);
			if (k?.startsWith(LEGACY_COMPONENT_PREFIX)) toRemove.push(k);
		}
		toRemove.forEach((k) => localStore.removeItem(k));
	}
}
