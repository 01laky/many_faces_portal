// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Edge-case coverage for the portal logout token reset (previously untested). Verifies it delegates to
 * clearLocalAuthSession with the caller's storage + token applier, and uses localStorage + the axios
 * setAuthToken as defaults.
 */

const { mockClear, mockSetAuthToken } = vi.hoisted(() => ({
	mockClear: vi.fn(),
	mockSetAuthToken: vi.fn(),
}));

vi.mock('@/hooks/api/authSessionActions', () => ({ clearLocalAuthSession: mockClear }));
vi.mock('@/api/config', () => ({ setAuthToken: mockSetAuthToken }));

import { resetPortalAuthSession } from '../portalAuthSession';

describe('resetPortalAuthSession', () => {
	beforeEach(() => {
		mockClear.mockReset();
	});

	it('delegates to clearLocalAuthSession with the provided storage and token applier', () => {
		const storage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		} as unknown as Parameters<typeof resetPortalAuthSession>[0];
		const apply = vi.fn();

		resetPortalAuthSession(storage, apply);

		expect(mockClear).toHaveBeenCalledTimes(1);
		expect(mockClear).toHaveBeenCalledWith(storage, apply);
	});

	it('defaults to localStorage and the axios setAuthToken applier', () => {
		resetPortalAuthSession();

		expect(mockClear).toHaveBeenCalledTimes(1);
		const [storageArg, applyArg] = mockClear.mock.calls[0];
		expect(storageArg).toBe(localStorage);
		expect(applyArg).toBe(mockSetAuthToken);
	});
});
