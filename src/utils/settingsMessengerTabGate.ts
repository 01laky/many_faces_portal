import type { SettingsTabId } from '@/features/settings';

/** PT-RP4 — lazy Messenger tab mounts only when active and authenticated. */
export function shouldMountMessengerSettingsTab(
	settingsTab: SettingsTabId,
	token: string | null
): boolean {
	return settingsTab === 'messenger' && Boolean(token);
}

/** PT-RP4 — SignalR tab scope follows open panel + messenger tab selection. */
export function resolveMessengerTabActive(
	settingsOpen: boolean,
	settingsTab: SettingsTabId
): boolean {
	return settingsOpen && settingsTab === 'messenger';
}
