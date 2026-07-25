// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FaceConfig } from '@/api/types/facesConfig';

/**
 * REF-F1…F6 — face selection edge cases for `FaceConfigProvider` (portal refactor Phase A §6.5).
 *
 * Phase A removed the `selected_face_id` localStorage key: the URL path is the source of truth for
 * guests, and `UserProfile.LastSelectedFaceId` (server) is the cold-start hint for authenticated
 * users. These tests pin that contract — the resolved `selectedFace`, the "no browser persistence"
 * rule, and the visit + profile PUT side effects of `selectFace`.
 *
 * The real `useFacesConfigQuery` runs against a real `QueryClient` (only the HTTP call underneath is
 * mocked) so the faces list arrives asynchronously exactly as it does in the browser — the mount
 * ordering between the profile hint and the "fall back to the first available face" reconciliation
 * is the whole point of REF-F2/REF-F3/REF-F6 and would be lost with a synchronous query stub.
 */

const getFacesConfig = vi.fn();
const markFaceVisited = vi.fn();
const updateProfile = vi.fn();
const invalidateFacePrefixCache = vi.fn();

let mockAuth: { isAuthenticated: boolean; token: string | null } = {
	isAuthenticated: false,
	token: null,
};
let mockProfile: { lastSelectedFaceId?: number | null } | undefined;

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));
vi.mock('@/hooks/api/useProfileApi', () => ({ useGlobalProfile: () => ({ data: mockProfile }) }));
vi.mock('@/api/config/getFacesConfig', () => ({
	getFacesConfig: (...args: unknown[]) => getFacesConfig(...args),
}));
vi.mock('@/api/services/faceProfilesApi', () => ({
	markFaceVisited: (...args: unknown[]) => markFaceVisited(...args),
}));
vi.mock('@/api/profile/profileApi', () => ({
	updateProfile: (...args: unknown[]) => updateProfile(...args),
}));
vi.mock('@/api/config', () => ({
	invalidateMemoizedFacePrefixCache: () => invalidateFacePrefixCache(),
}));
vi.mock('@/utils/logger', () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { FaceConfigProvider, useFaceConfig } from '../FaceConfigContext';

function face(id: number, index: string, isPublic = true): FaceConfig {
	return { id, index, title: `Face ${index}`, isPublic, pages: [] };
}

/** Two public faces, so `availableFaces` order is deterministic: [public(1), brandx(2)]. */
const FACES: FaceConfig[] = [face(1, 'public'), face(2, 'brandx')];

function renderFaceConfig(initialPath: string) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[initialPath]}>
				<FaceConfigProvider>{children}</FaceConfigProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
	const view = renderHook(() => useFaceConfig(), { wrapper });
	return { ...view, queryClient };
}

describe('FaceConfigContext face selection REF-F', () => {
	beforeEach(() => {
		getFacesConfig.mockReset().mockResolvedValue(FACES);
		markFaceVisited.mockReset().mockResolvedValue(undefined);
		updateProfile.mockReset().mockResolvedValue(undefined);
		invalidateFacePrefixCache.mockReset();
		mockAuth = { isAuthenticated: false, token: null };
		mockProfile = undefined;
		localStorage.clear();
	});

	it('REF-F1: URL /:lang/:faceIndex/... syncs context without localStorage', async () => {
		const { result } = renderFaceConfig('/en/brandx/home');

		await waitFor(() => expect(result.current.selectedFace?.id).toBe(2));
		expect(result.current.selectedFace?.index).toBe('brandx');
		// Phase A contract: face selection leaves no browser persistence behind.
		expect(localStorage.getItem('selected_face_id')).toBeNull();
		expect(localStorage.length).toBe(0);
	});

	it('REF-F2: authed lastSelectedFaceId from profile applied on load', async () => {
		mockAuth = { isAuthenticated: true, token: 'tok' };
		mockProfile = { lastSelectedFaceId: 2 };

		const { result } = renderFaceConfig('/homepage');

		// Without the server hint the provider would fall back to availableFaces[0] (id 1).
		await waitFor(() => expect(result.current.selectedFace?.id).toBe(2));
		expect(localStorage.length).toBe(0);
	});

	it('REF-F3: invalid stored face id server-side falls back to first available', async () => {
		mockAuth = { isAuthenticated: true, token: 'tok' };
		mockProfile = { lastSelectedFaceId: 999 };

		const { result } = renderFaceConfig('/homepage');

		await waitFor(() => expect(result.current.availableFaces).toHaveLength(2));
		await waitFor(() => expect(result.current.selectedFace?.id).toBe(1));
		expect(result.current.error).toBeNull();
	});

	it('REF-F4: guest on /homepage keeps no face id in localStorage', async () => {
		const { result } = renderFaceConfig('/homepage');

		await waitFor(() => expect(result.current.selectedFace?.id).toBe(1));
		expect(localStorage.length).toBe(0);
		// Guests have no token, so neither the visit API nor the profile PUT may fire.
		expect(markFaceVisited).not.toHaveBeenCalled();
		expect(updateProfile).not.toHaveBeenCalled();
	});

	it('REF-F5: selectFace calls the visit API and the profile PUT', async () => {
		mockAuth = { isAuthenticated: true, token: 'tok' };

		const { result, queryClient } = renderFaceConfig('/homepage');
		await waitFor(() => expect(result.current.selectedFace?.id).toBe(1));
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

		await act(async () => {
			result.current.selectFace(2);
		});

		expect(invalidateFacePrefixCache).toHaveBeenCalled();
		await waitFor(() => expect(markFaceVisited).toHaveBeenCalledWith(2, 'tok'));
		await waitFor(() =>
			expect(updateProfile).toHaveBeenCalledWith('tok', { lastSelectedFaceId: 2 })
		);
		await waitFor(() =>
			expect(invalidateQueries).toHaveBeenCalledWith(
				expect.objectContaining({ queryKey: ['facesConfig', 'tok'] })
			)
		);
		expect(result.current.selectedFace?.id).toBe(2);
	});

	it('REF-F6: explicit deep link overrides a stale server last face', async () => {
		mockAuth = { isAuthenticated: true, token: 'tok' };
		mockProfile = { lastSelectedFaceId: 1 }; // stale server value

		const { result } = renderFaceConfig('/en/brandx/home');

		await waitFor(() => expect(result.current.selectedFace?.id).toBe(2));
		// The deep link wins and is written back to the server, not overwritten by the stale hint.
		await waitFor(() => expect(markFaceVisited).toHaveBeenCalledWith(2, 'tok'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.selectedFace?.id).toBe(2);
	});
});
