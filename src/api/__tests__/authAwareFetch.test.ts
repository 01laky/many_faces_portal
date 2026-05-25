// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { getAccessTokenFromStorage } from '../../utils/authStorage';

vi.mock('../../utils/authStorage', () => ({
	getAccessTokenFromStorage: vi.fn(),
}));

import { authAwareFetch } from '../utils/authAwareFetch';

describe('authAwareFetch REF-A9', () => {
	it('401 guard uses getAccessTokenFromStorage', async () => {
		vi.mocked(getAccessTokenFromStorage).mockReturnValue('stored-token');
		const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
		vi.spyOn(global, 'fetch').mockResolvedValue(new Response('', { status: 401 }));

		await authAwareFetch('http://api.test/x', { token: 'tok' });

		expect(getAccessTokenFromStorage).toHaveBeenCalled();
		expect(dispatchSpy).toHaveBeenCalled();
	});
});
