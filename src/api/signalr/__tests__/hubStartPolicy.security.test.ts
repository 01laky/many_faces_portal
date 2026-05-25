import { describe, expect, it } from 'vitest';
import {
	shouldConnectAiChatHub,
	shouldConnectChatRoomHub,
	shouldConnectMessengerHub,
} from '../hubStartPolicy';

describe('hubStartPolicy (PSH1-T-C02…C04)', () => {
	it('PSH1-T-C02: messenger start skipped when !token', () => {
		expect(shouldConnectMessengerHub({ isAuthenticated: true, token: null })).toBe(false);
		expect(shouldConnectMessengerHub({ isAuthenticated: true, token: 'jwt' })).toBe(true);
	});

	it('PSH1-T-C03: chat room start skipped when not member', () => {
		expect(shouldConnectChatRoomHub({ token: 'jwt', isMember: false, isHostViewer: false })).toBe(
			false
		);
		expect(shouldConnectChatRoomHub({ token: 'jwt', isMember: true, isHostViewer: false })).toBe(
			true
		);
		expect(shouldConnectChatRoomHub({ token: 'jwt', isMember: true, isHostViewer: true })).toBe(
			false
		);
	});

	it('PSH1-T-C04: AI hub start skipped when AI disabled', () => {
		expect(shouldConnectAiChatHub({ token: 'jwt', aiGloballyEnabled: false })).toBe(false);
		expect(shouldConnectAiChatHub({ token: null, aiGloballyEnabled: true })).toBe(false);
		expect(shouldConnectAiChatHub({ token: 'jwt', aiGloballyEnabled: true })).toBe(true);
	});
});
