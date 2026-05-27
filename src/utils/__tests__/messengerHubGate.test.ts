import { describe, it, expect } from 'vitest';
import { resolveMessengerHubEnabled } from '@/utils/messengerHubGate';

describe('messengerHubGate (PT-RP9)', () => {
	it('PT-RP9-U1: scoped — hub off on home only', () => {
		expect(
			resolveMessengerHubEnabled({
				isAuthenticated: true,
				token: 'jwt',
				alwaysForBadge: false,
				messengerTabActive: false,
			})
		).toBe(false);
	});

	it('PT-RP9-U2: tab active enables hub', () => {
		expect(
			resolveMessengerHubEnabled({
				isAuthenticated: true,
				token: 'jwt',
				alwaysForBadge: false,
				messengerTabActive: true,
			})
		).toBe(true);
	});

	it('PT-RP9-U3: no token disables hub', () => {
		expect(
			resolveMessengerHubEnabled({
				isAuthenticated: true,
				token: null,
				alwaysForBadge: true,
				messengerTabActive: true,
			})
		).toBe(false);
	});
});
