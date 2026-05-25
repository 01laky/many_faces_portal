/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest';
import { setupAuthStorageSync } from '../authSessionSync';
import { AUTH_STORAGE_KEYS } from '../authStorage';

describe('authSessionSync (PSH1-T-A12)', () => {
	it('storage event clears token in other tab triggers callback', () => {
		const onClear = vi.fn();
		const remove = setupAuthStorageSync(onClear);
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: AUTH_STORAGE_KEYS.TOKEN,
				oldValue: 'jwt',
				newValue: null,
				storageArea: localStorage,
			})
		);
		expect(onClear).toHaveBeenCalledTimes(1);
		remove();
	});
});
