import type { HubConnection } from '@microsoft/signalr';
import { buildAuthenticatedHubConnection } from './buildAuthenticatedHubConnection';
import type { AccessTokenProvider } from './accessTokenProvider';

interface HubEntry {
	connection: HubConnection;
	refCount: number;
	hubKey: string;
}

const hubRegistry = new Map<string, HubEntry>();

function hubKey(hubRelativePath: string, scopeKey: string): string {
	return `${hubRelativePath}::${scopeKey}`;
}

/**
 * Reference-counted SignalR hub manager (PT-RP23).
 * One connection per hub path + scope; subscribers share negotiate/reconnect.
 */
export async function acquireHubConnection(
	hubRelativePath: string,
	scopeKey: string,
	accessTokenProvider: AccessTokenProvider | string
): Promise<HubConnection> {
	const key = hubKey(hubRelativePath, scopeKey);
	const existing = hubRegistry.get(key);
	if (existing) {
		existing.refCount += 1;
		if (existing.connection.state === 'Disconnected') {
			await existing.connection.start();
		}
		return existing.connection;
	}

	const connection = buildAuthenticatedHubConnection(hubRelativePath, accessTokenProvider);
	hubRegistry.set(key, { connection, refCount: 1, hubKey: key });
	await connection.start();
	return connection;
}

export async function releaseHubConnection(
	hubRelativePath: string,
	scopeKey: string
): Promise<void> {
	const key = hubKey(hubRelativePath, scopeKey);
	const entry = hubRegistry.get(key);
	if (!entry) return;
	entry.refCount -= 1;
	if (entry.refCount <= 0) {
		hubRegistry.delete(key);
		try {
			await entry.connection.stop();
		} catch {
			// best-effort stop
		}
	}
}

/** Test helper — tear down all hubs. */
export async function resetHubRegistryForTests(): Promise<void> {
	const stops = [...hubRegistry.values()].map(async (e) => {
		try {
			await e.connection.stop();
		} catch {
			// ignore
		}
	});
	await Promise.all(stops);
	hubRegistry.clear();
}

export function getHubRegistrySizeForTests(): number {
	return hubRegistry.size;
}
