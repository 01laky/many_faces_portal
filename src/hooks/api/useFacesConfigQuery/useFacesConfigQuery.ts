import { useCallback } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { getFacesConfig } from '@/api/config/getFacesConfig';
import type { FacesConfigResponse } from '@/api/types/facesConfig';
import { meCapabilitiesTokenFingerprint } from '@/hooks/api/useMeCapabilities';

export const facesConfigKeys = {
	all: ['facesConfig'] as const,
	session: (tokenFingerprint: string) => [...facesConfigKeys.all, tokenFingerprint] as const,
};

export function createFacesConfigQueryOptions(
	token: string | null | undefined,
	enabled = true
): UseQueryOptions<
	FacesConfigResponse,
	Error,
	FacesConfigResponse,
	ReturnType<typeof facesConfigKeys.session>
> {
	const fingerprint = meCapabilitiesTokenFingerprint(token);
	return {
		queryKey: facesConfigKeys.session(fingerprint),
		queryFn: () => getFacesConfig(token ?? undefined),
		enabled,
		staleTime: 5 * 60_000,
		gcTime: 20 * 60_000,
		retry: 1,
	};
}

export function useFacesConfigQuery(token: string | null | undefined, enabled = true) {
	return useQuery(createFacesConfigQueryOptions(token, enabled));
}

export function useInvalidateFacesConfig() {
	const queryClient = useQueryClient();
	/*
	 * Stable identity matters here: `FaceConfigContext` lists this callback in the dependency array of
	 * `selectFace`, and `selectFace` is itself a dependency of the memoised provider value (Phase A
	 * §5.3 / REF-X1). Returning a fresh arrow on every render silently defeated both memos, so the
	 * face-config context object was rebuilt — and every consumer re-rendered — on each parent render.
	 * `queryClient` is stable for the lifetime of the `QueryClientProvider`, so this never re-creates
	 * in practice; the behavior of the returned function is unchanged.
	 */
	return useCallback(
		(token: string | null | undefined) =>
			queryClient.invalidateQueries({
				queryKey: facesConfigKeys.session(meCapabilitiesTokenFingerprint(token)),
			}),
		[queryClient]
	);
}
