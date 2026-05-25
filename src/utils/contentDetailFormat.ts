/** Shared display/error helpers for portal content detail pages. */

export function mutationErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === 'string' && error.trim()) return error.trim();
	return 'Request failed';
}

export function formatContentValue(value: string | number | boolean | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';
	return String(value);
}

/** Format ISO date for content detail headers and comment timestamps. */
export function formatContentDate(value: string | null | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}
