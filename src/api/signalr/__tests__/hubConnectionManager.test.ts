import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	acquireHubConnection,
	releaseHubConnection,
	resetHubRegistryForTests,
	getHubRegistrySizeForTests,
} from '@/api/signalr/hubConnectionManager';
import { buildAuthenticatedHubConnection } from '@/api/signalr/buildAuthenticatedHubConnection';

vi.mock('@/api/signalr/buildAuthenticatedHubConnection', () => {
	const connections: Array<{
		state: string;
		start: ReturnType<typeof vi.fn>;
		stop: ReturnType<typeof vi.fn>;
		on: ReturnType<typeof vi.fn>;
		off: ReturnType<typeof vi.fn>;
	}> = [];

	return {
		buildAuthenticatedHubConnection: vi.fn(() => {
			const conn = {
				state: 'Disconnected',
				start: vi.fn(async () => {
					conn.state = 'Connected';
				}),
				stop: vi.fn(async () => {
					conn.state = 'Disconnected';
				}),
				on: vi.fn(),
				off: vi.fn(),
			};
			connections.push(conn);
			return conn;
		}),
	};
});

describe('hubConnectionManager (PT-RP23)', () => {
	beforeEach(async () => {
		await resetHubRegistryForTests();
		vi.mocked(buildAuthenticatedHubConnection).mockClear();
	});

	afterEach(async () => {
		await resetHubRegistryForTests();
	});

	it('PT-RP23-U1: acquire creates one registry entry', async () => {
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		expect(getHubRegistrySizeForTests()).toBe(1);
		expect(buildAuthenticatedHubConnection).toHaveBeenCalledTimes(1);
	});

	it('PT-RP23-U2: second acquire same path+scope shares entry', async () => {
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		expect(getHubRegistrySizeForTests()).toBe(1);
		expect(buildAuthenticatedHubConnection).toHaveBeenCalledTimes(1);
	});

	it('PT-RP23-U2b: different hub paths are separate entries', async () => {
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		await acquireHubConnection('/hubs/chatroom', 'scope-a', 'token-a');
		expect(getHubRegistrySizeForTests()).toBe(2);
	});

	it('PT-RP23-U4: release after last subscriber clears registry', async () => {
		await acquireHubConnection('/hubs/chatroom', 'scope-a', 'token-a');
		await releaseHubConnection('/hubs/chatroom', 'scope-a');
		expect(getHubRegistrySizeForTests()).toBe(0);
	});

	it('PT-RP23-U4b: partial release keeps hub until refcount zero', async () => {
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		await releaseHubConnection('/hubs/messenger', 'scope-a');
		expect(getHubRegistrySizeForTests()).toBe(1);
		await releaseHubConnection('/hubs/messenger', 'scope-a');
		expect(getHubRegistrySizeForTests()).toBe(0);
	});

	it('PT-RP23-U3: reconnects disconnected shared hub on acquire', async () => {
		const conn = await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		await conn.stop();
		await acquireHubConnection('/hubs/messenger', 'scope-a', 'token-a');
		expect(conn.start).toHaveBeenCalled();
	});
});
