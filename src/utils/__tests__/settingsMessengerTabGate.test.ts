import { describe, it, expect } from 'vitest';
import { resolveMessengerHubEnabled } from '@/utils/messengerHubGate';
import {
	resolveMessengerTabActive,
	shouldMountMessengerSettingsTab,
} from '@/utils/settingsMessengerTabGate';

describe('settingsMessengerTabGate (PT-RP4)', () => {
	it('PT-RP4-U1: profile tab does not mount messenger chunk', () => {
		expect(shouldMountMessengerSettingsTab('profile', 'jwt')).toBe(false);
		expect(shouldMountMessengerSettingsTab('settings', 'jwt')).toBe(false);
	});

	it('PT-RP4-U2: messenger tab mounts only with token', () => {
		expect(shouldMountMessengerSettingsTab('messenger', 'jwt')).toBe(true);
		expect(shouldMountMessengerSettingsTab('messenger', null)).toBe(false);
	});

	it('PT-RP4-U3: closing panel deactivates messenger tab scope for hub gate', () => {
		expect(resolveMessengerTabActive(true, 'messenger')).toBe(true);
		expect(resolveMessengerTabActive(false, 'messenger')).toBe(false);
		expect(
			resolveMessengerHubEnabled({
				isAuthenticated: true,
				token: 'jwt',
				alwaysForBadge: false,
				messengerTabActive: resolveMessengerTabActive(false, 'messenger'),
			})
		).toBe(false);
	});
});
