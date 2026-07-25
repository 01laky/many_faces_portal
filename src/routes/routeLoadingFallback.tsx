import { GlobalAppPreloader } from '../components/GlobalAppPreloader';

/**
 * Suspense fallback for lazy route chunks (GPL-22, §3.6.3 tier C).
 *
 * Uses the inline `route-fallback` variant — 64px logo, no brand title, static flow
 * position — so a code-split navigation never repaints the fixed full-viewport
 * bootstrap shell and looks like a cold start.
 */
export function RouteLoadingFallback() {
	return <GlobalAppPreloader accessibilityLabel="Loading page" variant="route-fallback" />;
}
