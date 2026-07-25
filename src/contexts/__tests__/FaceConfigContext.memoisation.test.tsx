// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memo, type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FaceConfig } from '@/api/types/facesConfig';

/**
 * REF-X1 — provider-value memoisation for `FaceConfigProvider` (portal refactor Phase A §6.10).
 *
 * Phase A theme 3 wrapped the provider value in `useMemo`. The regression this guards against is a
 * fresh object literal being handed to `<FaceConfigContext.Provider value={...}>` on every render,
 * which re-renders **every** consumer in the tree even when nothing changed — `React.memo` cannot
 * stop context propagation, so a memoised consumer is the sharpest probe available.
 *
 * The assertions are therefore about identity and render counts, not about rendered output:
 *   1. the context object is referentially identical across parent re-renders with unchanged deps;
 *   2. a `React.memo` consumer does not re-render at all during those re-renders;
 *   3. the probe is still sensitive — changing a real dependency (`selectedFace` via `selectFace`)
 *      does produce a new object and does re-render the consumer.
 */

const getFacesConfig = vi.fn();
const markFaceVisited = vi.fn();
const updateProfile = vi.fn();

let mockAuth: { isAuthenticated: boolean; token: string | null } = {
	isAuthenticated: false,
	token: null,
};

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));
vi.mock('@/hooks/api/useProfileApi', () => ({ useGlobalProfile: () => ({ data: undefined }) }));
vi.mock('@/api/config/getFacesConfig', () => ({
	getFacesConfig: (...args: unknown[]) => getFacesConfig(...args),
}));
vi.mock('@/api/services/faceProfilesApi', () => ({
	markFaceVisited: (...args: unknown[]) => markFaceVisited(...args),
}));
vi.mock('@/api/profile/profileApi', () => ({
	updateProfile: (...args: unknown[]) => updateProfile(...args),
}));
vi.mock('@/api/config', () => ({ invalidateMemoizedFacePrefixCache: vi.fn() }));
vi.mock('@/utils/logger', () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { FaceConfigProvider, useFaceConfig } from '../FaceConfigContext';

function face(id: number, index: string): FaceConfig {
	return { id, index, title: `Face ${index}`, isPublic: true, pages: [] };
}

const FACES: FaceConfig[] = [face(1, 'public'), face(2, 'brandx')];

let consumerRenders = 0;

/**
 * Memoised consumer: its props never change, so the only thing that can re-render it is a new
 * context value reaching `useFaceConfig()`.
 */
const MemoisedFaceConsumer = memo(function MemoisedFaceConsumer() {
	useFaceConfig();
	consumerRenders += 1;
	return null;
});

function renderFaceConfig(initialPath: string) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[initialPath]}>
				<FaceConfigProvider>
					<MemoisedFaceConsumer />
					{children}
				</FaceConfigProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
	return renderHook(() => useFaceConfig(), { wrapper });
}

describe('FaceConfigContext memoisation REF-X', () => {
	beforeEach(() => {
		getFacesConfig.mockReset().mockResolvedValue(FACES);
		markFaceVisited.mockReset().mockResolvedValue(undefined);
		updateProfile.mockReset().mockResolvedValue(undefined);
		mockAuth = { isAuthenticated: false, token: null };
		consumerRenders = 0;
	});

	it('REF-X1: FaceConfigContext value is referentially stable when deps are unchanged', async () => {
		const { result, rerender } = renderFaceConfig('/en/brandx/home');

		// Let the faces query and the path -> face reconciliation settle first.
		await waitFor(() => expect(result.current.selectedFace?.id).toBe(2));
		await act(async () => {
			await Promise.resolve();
		});

		const stableValue = result.current;
		const rendersAfterMount = consumerRenders;

		rerender();
		rerender();

		expect(result.current).toBe(stableValue);
		expect(result.current.selectFace).toBe(stableValue.selectFace);
		expect(result.current.availableFaces).toBe(stableValue.availableFaces);
		expect(result.current.getFaceHomePath).toBe(stableValue.getFaceHomePath);
		expect(consumerRenders).toBe(rendersAfterMount);
	});

	it('REF-X1: a real dependency change still produces a new value and re-renders consumers', async () => {
		// `/homepage` carries no face segment, so nothing re-pins the selection and `selectFace` sticks.
		const { result } = renderFaceConfig('/homepage');

		await waitFor(() => expect(result.current.selectedFace?.id).toBe(1));
		await act(async () => {
			await Promise.resolve();
		});

		const before = result.current;
		const rendersBefore = consumerRenders;

		await act(async () => {
			result.current.selectFace(2);
		});

		expect(result.current).not.toBe(before);
		expect(result.current.selectedFace?.id).toBe(2);
		expect(consumerRenders).toBeGreaterThan(rendersBefore);
	});
});
