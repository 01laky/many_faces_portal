import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { QueryProviderProps } from './types';

/**
 * TanStack Query defaults for `many_faces_portal`.
 *
 * **Stale vs fresh (matrix in code, not only defaults):**
 * - **Global `staleTime` (5 min):** list/read-mostly data where showing slightly old UI is OK.
 * - **`useAuthToken` (60s stale, 10 min gc):** token must track expiry + cross-tab sooner than generic lists.
 * - **`useMeCapabilities` (60s stale, 15 min gc):** ACL rarely changes per session; keep bounded memory.
 * - **`useProfile`:** profile + avatar; `gcTime` caps cache when switching faces.
 * - **Mutations / one-shots:** rely on defaults; invalidate explicitly after writes.
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
			gcTime: 20 * 60 * 1000,
		},
		mutations: {
			retry: 1,
		},
	},
});

export function QueryProvider({ children }: QueryProviderProps) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
