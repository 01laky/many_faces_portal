// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppBootstrapReady } from '../useAppBootstrapReady';

const useAuthMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
	useAuth: () => useAuthMock(),
}));

describe('useAppBootstrapReady GPL', () => {
	it('GPL-1: not ready when face config loading', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true });
		const { result } = renderHook(() =>
			useAppBootstrapReady({ faceConfig: { isLoading: true, error: null } })
		);
		expect(result.current.isReady).toBe(false);
		expect(result.current.flags.faceConfigReady).toBe(false);
	});

	it('GPL-2: ready when auth session latched and face config ready', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true });
		const { result } = renderHook(() =>
			useAppBootstrapReady({ faceConfig: { isLoading: false, error: null } })
		);
		expect(result.current.isReady).toBe(true);
	});

	it('GPL-3: error when face config fails', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true });
		const { result } = renderHook(() =>
			useAppBootstrapReady({
				faceConfig: { isLoading: false, error: new Error('offline') },
			})
		);
		expect(result.current.isReady).toBe(false);
		expect(result.current.error?.message).toBe('offline');
	});

	it('GPL-3b: login isLoading does not reset auth session latch', () => {
		useAuthMock.mockReturnValue({ isSessionHydrated: true, isLoading: true });
		const { result } = renderHook(() =>
			useAppBootstrapReady({ faceConfig: { isLoading: false, error: null } })
		);
		expect(result.current.flags.authSessionReady).toBe(true);
		expect(result.current.isReady).toBe(true);
	});
});
