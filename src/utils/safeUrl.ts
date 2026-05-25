/**
 * PSH1-B7 / PSH1-D8 — HTTPS media URLs and backend-signed upload serve links.
 */

const DEV_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Backend HMAC serve endpoint (BE-U2) — path must include sig + exp query params. */
export function isSignedUploadServeUrl(raw: string | null | undefined): boolean {
	if (typeof raw !== 'string' || !raw.trim()) return false;
	try {
		const trimmed = raw.trim();
		const url = trimmed.startsWith('/')
			? new URL(trimmed, 'https://uploads.local')
			: new URL(trimmed);
		const path = url.pathname.toLowerCase();
		return (
			path.includes('/api/uploads/serve') &&
			url.searchParams.has('sig') &&
			url.searchParams.has('exp')
		);
	} catch {
		return false;
	}
}

export function isAllowedHttpsUrl(raw: string | null | undefined): boolean {
	if (typeof raw !== 'string' || raw.trim() === '') return false;

	try {
		const url = new URL(raw.trim());
		if (url.protocol !== 'https:') return false;
		if (url.username || url.password) return false;
		const host = url.hostname.toLowerCase();
		if (!import.meta.env.DEV && DEV_HOSTS.has(host)) return false;
		return true;
	} catch {
		return false;
	}
}

/** Returns url when allowed (HTTPS CDN or signed serve URL), otherwise empty string. */
export function sanitizeMediaUrl(raw: string | null | undefined): string {
	if (!raw?.trim()) return '';
	const trimmed = raw.trim();
	if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) return '';

	try {
		const parsed = trimmed.startsWith('/')
			? new URL(trimmed, 'https://uploads.local')
			: new URL(trimmed);
		const path = parsed.pathname.toLowerCase();
		if (path.includes('/api/uploads/serve') && !isSignedUploadServeUrl(trimmed)) {
			return '';
		}
	} catch {
		return '';
	}

	if (isSignedUploadServeUrl(trimmed)) return trimmed;
	if (import.meta.env.DEV) {
		try {
			const url = new URL(trimmed);
			if (DEV_HOSTS.has(url.hostname.toLowerCase())) return trimmed;
		} catch {
			/* fall through */
		}
	}
	return isAllowedHttpsUrl(trimmed) ? trimmed : '';
}

export function sanitizeHttpsUrl(raw: string | null | undefined): string {
	return sanitizeMediaUrl(raw);
}
