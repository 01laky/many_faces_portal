import { describe, it, expect } from 'vitest';
import {
	LIVE_ROSTER_POLL_MS,
	resolveVideoLoungeRefetchInterval,
	shouldRunVideoLoungeHeartbeat,
} from '@/pages/VideoLoungeDetailPage/videoLoungePollLogic';

describe('videoLoungePollLogic (PT-RP13)', () => {
	it('PT-RP13-U1: hidden tab disables poll', () => {
		expect(resolveVideoLoungeRefetchInterval(false, 'lobby')).toBe(false);
	});

	it('PT-RP13-U2: visible lobby/live enables poll', () => {
		expect(resolveVideoLoungeRefetchInterval(true, 'lobby')).toBe(LIVE_ROSTER_POLL_MS);
		expect(resolveVideoLoungeRefetchInterval(true, 'live')).toBe(LIVE_ROSTER_POLL_MS);
	});

	it('non-live phase disables poll even when visible', () => {
		expect(resolveVideoLoungeRefetchInterval(true, 'ended')).toBe(false);
	});

	it('heartbeat only when live visible authed', () => {
		expect(
			shouldRunVideoLoungeHeartbeat({
				pageVisible: true,
				phase: 'live',
				faceId: 1,
				token: 'jwt',
			})
		).toBe(true);
		expect(
			shouldRunVideoLoungeHeartbeat({
				pageVisible: false,
				phase: 'live',
				faceId: 1,
				token: 'jwt',
			})
		).toBe(false);
	});
});
