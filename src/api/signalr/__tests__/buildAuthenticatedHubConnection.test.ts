import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildAuthenticatedHubConnection } from '../buildAuthenticatedHubConnection';

const mockWithUrl = vi.fn().mockReturnThis();
const mockWithAutomaticReconnect = vi.fn().mockReturnThis();
const mockBuild = vi.fn(() => ({ id: 'hub-connection' }));

vi.mock('@microsoft/signalr', () => ({
	HubConnectionBuilder: class MockHubConnectionBuilder {
		withUrl(...args: unknown[]) {
			mockWithUrl(...args);
			return this;
		}
		withAutomaticReconnect() {
			mockWithAutomaticReconnect();
			return this;
		}
		build() {
			return mockBuild();
		}
	},
}));

vi.mock('../../faceApiRouting', () => ({
	absoluteScopedUrl: vi.fn((path: string) => `https://api.test/public${path}`),
}));

describe('buildAuthenticatedHubConnection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('builds hub URL via absoluteScopedUrl and passes access token factory', () => {
		const conn = buildAuthenticatedHubConnection('/hubs/messenger', 'jwt-abc');

		expect(conn).toEqual({ id: 'hub-connection' });
		expect(mockWithUrl).toHaveBeenCalledWith(
			'https://api.test/public/hubs/messenger',
			expect.objectContaining({
				accessTokenFactory: expect.any(Function),
			})
		);
		const factory = mockWithUrl.mock.calls[0]![1].accessTokenFactory as () => string;
		expect(factory()).toBe('jwt-abc');
		expect(mockWithAutomaticReconnect).toHaveBeenCalled();
		expect(mockBuild).toHaveBeenCalled();
	});
});
