import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchMeCapabilities } from '../../api/meCapabilitiesClient';
import type { MeCapabilities } from '../../acl/capabilitiesTypes';

export const meCapabilitiesKeys = {
  all: ['meCapabilities'] as const,
  session: (tokenFingerprint: string) => [...meCapabilitiesKeys.all, tokenFingerprint] as const,
};

export function meCapabilitiesTokenFingerprint(token: string | null | undefined): string {
  return token && token.length > 24 ? `${token.slice(0, 12)}...${token.slice(-8)}` : (token ?? '');
}

/** Shared with tests (Node) so hook behavior is asserted without jsdom. */
export function createMeCapabilitiesQueryOptions(
  token: string | null | undefined,
  enabled = true
): UseQueryOptions<
  MeCapabilities | null,
  Error,
  MeCapabilities | null,
  ReturnType<typeof meCapabilitiesKeys.session>
> {
  const fingerprint = meCapabilitiesTokenFingerprint(token);
  return {
    queryKey: meCapabilitiesKeys.session(fingerprint),
    queryFn: () => fetchMeCapabilities(token!),
    enabled: Boolean(enabled && token),
    staleTime: 60_000,
  };
}

/**
 * Loads ACL capabilities for the current face-prefixed API base URL and JWT.
 * Disabled when there is no token (e.g. logged out).
 */
export function useMeCapabilities(token: string | null | undefined, enabled = true) {
  return useQuery(createMeCapabilitiesQueryOptions(token, enabled));
}
