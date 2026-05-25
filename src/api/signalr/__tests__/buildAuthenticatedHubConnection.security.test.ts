import { describe, expect, it, vi } from 'vitest';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { buildAuthenticatedHubConnection } from '../buildAuthenticatedHubConnection';
import { resolveHubAccessToken } from '../../../utils/authStorage';

vi.mock('../../faceApiRouting', () => ({
	absoluteScopedUrl: (path: string) => `https://api.example.com/public${path}`,
}));

const withUrlSpy = vi.spyOn(HubConnectionBuilder.prototype, 'withUrl');

describe('SignalR hub (PSH1-T-C01, C05)', () => {
	it('PSH1-T-C01: hub URL includes face-scoped path segment', () => {
		withUrlSpy.mockClear();
		buildAuthenticatedHubConnection('/hubs/messenger', () => 'jwt');
		expect(withUrlSpy).toHaveBeenCalled();
		const hubUrl = withUrlSpy.mock.calls.at(-1)?.[0] as string;
		expect(hubUrl).toContain('/hubs/messenger');
	});

	it('PSH1-T-C05: resolveHubAccessToken prefers in-memory ref', () => {
		const storage = {
			getItem: () => 'stored-jwt',
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};
		expect(resolveHubAccessToken('live-jwt', storage)).toBe('live-jwt');
		expect(resolveHubAccessToken(null, storage)).toBe('stored-jwt');
	});

	it('access token factory reads latest value from provider', () => {
		withUrlSpy.mockClear();
		let token = 'first';
		buildAuthenticatedHubConnection('/hubs/chat', () => token);
		const options = withUrlSpy.mock.calls.at(-1)?.[1] as { accessTokenFactory: () => string };
		expect(options.accessTokenFactory()).toBe('first');
		token = 'second';
		expect(options.accessTokenFactory()).toBe('second');
	});
});
