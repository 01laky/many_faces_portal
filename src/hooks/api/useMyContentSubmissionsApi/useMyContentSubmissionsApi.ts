import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '@/api/core/OpenAPI';
import { request as __request } from '@/api/core/request';
import type { MyContentSubmission } from '@/utils/contentModeration';

/**
 * React Query hook for `GET /api/my/content-submissions`.
 * Returns the caller's albums, blogs, and reels with moderation metadata safe for creator UI.
 */
export const myContentSubmissionKeys = {
	all: ['myContentSubmissions'] as const,
};

/** Thin typed wrapper over the manual OpenAPI request helper (no generated client update required). */
export async function fetchMyContentSubmissions() {
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/my/content-submissions',
	}) as Promise<MyContentSubmission[]>;
}

/** Cached list query; disabled callers should pass `enabled: false` from route guards. */
export function useMyContentSubmissions(enabled = true) {
	return useQuery({
		queryKey: myContentSubmissionKeys.all,
		queryFn: fetchMyContentSubmissions,
		enabled,
		staleTime: 30_000,
	});
}
