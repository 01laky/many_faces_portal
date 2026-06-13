// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
	GradientAnimationPreferenceProvider,
	useGradientAnimationPreference,
} from '../GradientAnimationPreferenceContext';

/**
 * Edge-case coverage for the gradient-animation preference provider (gradient prompt Phase B/C). Covers
 * the guest-vs-authenticated source of truth, the prefers-reduced-motion override, the optimistic PUT
 * with cache write-back, and the rollback + toast on a failed save.
 */

const mockUpdateProfile = vi.fn();
const mockReadGuest = vi.fn();
const mockWriteGuest = vi.fn();
let mockAuth: { isAuthenticated: boolean; token: string | null } = {
	isAuthenticated: false,
	token: null,
};
let mockProfile: { enableAnimatedGradient?: boolean } | undefined;
let mockUpdateLoading = false;

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));
vi.mock('@/contexts/FaceConfigContext', () => ({
	useFaceConfig: () => ({ selectedFace: { id: 1 } }),
}));
vi.mock('@/hooks/api/useProfileApi', () => ({
	useProfile: () => ({
		profile: mockProfile,
		updateProfile: (data: unknown) => mockUpdateProfile(data),
		updateProfileLoading: mockUpdateLoading,
	}),
	profileQueryKey: (faceId: number | null) => ['profile', faceId ?? null],
}));
vi.mock('@/utils/gradientAnimationPreferenceStorage', () => ({
	readGuestGradientAnimationEnabled: () => mockReadGuest(),
	writeGuestGradientAnimationEnabled: (v: boolean) => mockWriteGuest(v),
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function stubMatchMedia(reducedMotion: boolean) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: query.includes('reduce') ? reducedMotion : false,
		media: query,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
		onchange: null,
	})) as unknown as typeof window.matchMedia;
}

function setup(opts: {
	authenticated?: boolean;
	token?: string | null;
	profileEnabled?: boolean;
	guest?: boolean;
	reducedMotion?: boolean;
	updateLoading?: boolean;
}) {
	mockAuth = {
		isAuthenticated: opts.authenticated ?? false,
		token: opts.token === undefined ? (opts.authenticated ? 'tok' : null) : opts.token,
	};
	mockProfile = opts.authenticated
		? { enableAnimatedGradient: opts.profileEnabled ?? false }
		: undefined;
	mockUpdateLoading = opts.updateLoading ?? false;
	mockReadGuest.mockReturnValue(opts.guest ?? false);
	stubMatchMedia(opts.reducedMotion ?? false);

	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={qc}>
			<GradientAnimationPreferenceProvider>{children}</GradientAnimationPreferenceProvider>
		</QueryClientProvider>
	);
	const view = renderHook(() => useGradientAnimationPreference(), { wrapper });
	return { ...view, qc };
}

describe('GradientAnimationPreferenceContext', () => {
	beforeEach(() => {
		mockUpdateProfile.mockReset().mockResolvedValue(undefined);
		mockReadGuest.mockReset();
		mockWriteGuest.mockReset();
		vi.mocked(toast.error).mockReset();
	});

	it('throws when used outside the provider', () => {
		expect(() => renderHook(() => useGradientAnimationPreference())).toThrow(
			/must be used within GradientAnimationPreferenceProvider/
		);
	});

	describe('guest visitor', () => {
		it('reads the want flag from guest storage', () => {
			const { result } = setup({ guest: true });
			expect(result.current.userWantsAnimation).toBe(true);
			expect(result.current.animationEnabled).toBe(true);
		});

		it('persists the toggle to guest storage', async () => {
			const { result } = setup({ guest: false });
			await act(async () => {
				await result.current.setAnimationEnabled(true);
			});
			expect(mockWriteGuest).toHaveBeenCalledWith(true);
			expect(result.current.userWantsAnimation).toBe(true);
		});
	});

	describe('prefers-reduced-motion', () => {
		it('forces animationEnabled off even when the user wants it', () => {
			const { result } = setup({ guest: true, reducedMotion: true });
			expect(result.current.userWantsAnimation).toBe(true);
			expect(result.current.prefersReducedMotion).toBe(true);
			expect(result.current.animationEnabled).toBe(false);
		});

		it('makes setAnimationEnabled a no-op under reduced motion', async () => {
			const { result } = setup({ guest: false, reducedMotion: true });
			await act(async () => {
				await result.current.setAnimationEnabled(true);
			});
			expect(mockWriteGuest).not.toHaveBeenCalled();
			expect(mockUpdateProfile).not.toHaveBeenCalled();
		});
	});

	describe('authenticated user', () => {
		it('reads the want flag from the profile', () => {
			const { result } = setup({ authenticated: true, profileEnabled: true });
			expect(result.current.userWantsAnimation).toBe(true);
			expect(result.current.animationEnabled).toBe(true);
		});

		it('saves via updateProfile and optimistically writes the profile cache', async () => {
			const { result, qc } = setup({ authenticated: true, profileEnabled: false });
			qc.setQueryData(['profile', 1], { enableAnimatedGradient: false });

			await act(async () => {
				await result.current.setAnimationEnabled(true);
			});

			expect(mockUpdateProfile).toHaveBeenCalledWith({ enableAnimatedGradient: true });
			expect(qc.getQueryData(['profile', 1])).toMatchObject({ enableAnimatedGradient: true });
		});

		it('errors with a toast and does not call updateProfile when the token is missing', async () => {
			const { result } = setup({ authenticated: true, token: null, profileEnabled: false });
			await act(async () => {
				await result.current.setAnimationEnabled(true);
			});
			expect(mockUpdateProfile).not.toHaveBeenCalled();
			expect(toast.error).toHaveBeenCalled();
		});

		it('rolls back the optimistic cache write and toasts when the save fails', async () => {
			mockUpdateProfile.mockRejectedValueOnce(new Error('network down'));
			const { result, qc } = setup({ authenticated: true, profileEnabled: false });
			qc.setQueryData(['profile', 1], { enableAnimatedGradient: false });

			await act(async () => {
				await result.current.setAnimationEnabled(true);
			});

			await waitFor(() =>
				expect(qc.getQueryData(['profile', 1])).toMatchObject({ enableAnimatedGradient: false })
			);
			expect(toast.error).toHaveBeenCalledWith('network down');
		});

		it('reflects the in-flight update via isUpdating', () => {
			const { result } = setup({ authenticated: true, profileEnabled: false, updateLoading: true });
			expect(result.current.isUpdating).toBe(true);
		});
	});
});
