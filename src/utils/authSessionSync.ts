import { AUTH_STORAGE_KEYS } from './authStorage';

/** PSH1-A5 — when another tab clears auth storage, fail closed in this tab too. */
export function setupAuthStorageSync(onRemoteSessionCleared: () => void): () => void {
	if (typeof window === 'undefined') return () => undefined;

	const handler = (event: StorageEvent) => {
		if (event.key === AUTH_STORAGE_KEYS.TOKEN && event.newValue == null) {
			onRemoteSessionCleared();
		}
		if (
			event.key === AUTH_STORAGE_KEYS.REFRESH_TOKEN &&
			event.newValue == null &&
			event.oldValue != null
		) {
			onRemoteSessionCleared();
		}
	};

	window.addEventListener('storage', handler);
	return () => window.removeEventListener('storage', handler);
}
