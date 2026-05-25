export interface GlobalAppPreloaderProps {
	accessibilityLabel?: string;
	/** Smaller variant for lazy route Suspense fallback (Phase C). */
	variant?: 'bootstrap' | 'route-fallback';
}
