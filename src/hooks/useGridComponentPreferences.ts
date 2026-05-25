import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
	getFaceGridSettings,
	updateFaceGridSettings,
	type GridComponentPreferences,
} from '../api/profile/profileApi';

const SESSION_PREFIX = 'component-settings-';
const PUT_DEBOUNCE_MS = 400;

function sessionKey(componentId: string): string {
	return SESSION_PREFIX + componentId;
}

function readGuestSettings(componentId: string): GridComponentPreferences {
	if (typeof sessionStorage === 'undefined') return {};
	try {
		const raw = sessionStorage.getItem(sessionKey(componentId));
		return raw ? (JSON.parse(raw) as GridComponentPreferences) : {};
	} catch {
		return {};
	}
}

function writeGuestSettings(componentId: string, data: GridComponentPreferences): void {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(sessionKey(componentId), JSON.stringify(data));
	} catch {
		// ignore quota errors
	}
}

export interface GridComponentSettings {
	autoplay?: boolean;
}

export function useGridComponentPreferences(
	componentId: string,
	faceId: number | null
): {
	settings: GridComponentSettings;
	setAutoplay: (enabled: boolean) => void;
	autoplayEnabled: boolean;
	isLoading: boolean;
} {
	const { token, isAuthenticated } = useAuth();
	const [settings, setSettings] = useState<GridComponentSettings>(() =>
		isAuthenticated ? {} : readGuestSettings(componentId)
	);
	const [isLoading, setIsLoading] = useState(false);
	const putTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const optimisticRef = useRef<GridComponentSettings>(settings);

	useEffect(() => {
		optimisticRef.current = settings;
	}, [settings]);

	useEffect(() => {
		if (!isAuthenticated || !token || faceId == null) {
			queueMicrotask(() => setSettings(readGuestSettings(componentId)));
			return;
		}

		let cancelled = false;
		queueMicrotask(() => setIsLoading(true));
		void (async () => {
			try {
				const res = await getFaceGridSettings(token, faceId);
				if (cancelled) return;
				const entry = res.gridComponents[componentId] ?? {};
				if (!cancelled) queueMicrotask(() => setSettings(entry));
			} catch {
				if (!cancelled) {
					queueMicrotask(() => setSettings(optimisticRef.current));
				}
			} finally {
				if (!cancelled) queueMicrotask(() => setIsLoading(false));
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, token, faceId, componentId]);

	const persistAuthed = useCallback(
		(next: GridComponentSettings) => {
			if (!token || faceId == null) return;
			if (putTimerRef.current) clearTimeout(putTimerRef.current);
			putTimerRef.current = setTimeout(() => {
				void updateFaceGridSettings(token, faceId, {
					gridComponents: { [componentId]: next },
				}).catch(() => {
					// keep optimistic in-memory value for session
				});
			}, PUT_DEBOUNCE_MS);
		},
		[token, faceId, componentId]
	);

	const setAutoplay = useCallback(
		(enabled: boolean) => {
			const next = { ...optimisticRef.current, autoplay: enabled };
			optimisticRef.current = next;
			setSettings(next);
			if (isAuthenticated && token && faceId != null) {
				persistAuthed(next);
			} else {
				writeGuestSettings(componentId, next);
			}
		},
		[isAuthenticated, token, faceId, componentId, persistAuthed]
	);

	useEffect(
		() => () => {
			if (putTimerRef.current) clearTimeout(putTimerRef.current);
		},
		[]
	);

	const autoplayEnabled = useMemo(() => settings.autoplay ?? false, [settings.autoplay]);

	return { settings, setAutoplay, autoplayEnabled, isLoading };
}
