/**
 * PSH1-A4 — allow-list internal post-login redirects (no open redirect / javascript:).
 */

const LOCALIZED_PATH = /^\/[a-z]{2}(\/|$)/;

export function resolveSafeInternalRedirectPath(
	candidate: string | undefined,
	fallback: string,
	origin: string = typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
): string {
	if (!candidate?.trim()) return fallback;

	const trimmed = candidate.trim();
	if (trimmed.startsWith('//') || /^https?:\/\//i.test(trimmed) || /^javascript:/i.test(trimmed)) {
		try {
			const parsed = new URL(trimmed, origin);
			if (parsed.origin !== origin) return fallback;
			if (!LOCALIZED_PATH.test(parsed.pathname)) return fallback;
			if (parsed.pathname.includes('/login')) return fallback;
			return `${parsed.pathname}${parsed.search}${parsed.hash}`;
		} catch {
			return fallback;
		}
	}

	if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
	if (!LOCALIZED_PATH.test(trimmed.split('?')[0] ?? '')) return fallback;
	if (trimmed.includes('/login')) return fallback;
	return trimmed;
}
