/** PT-RP9 — when messenger SignalR hub should connect. */
export function resolveMessengerHubEnabled(input: {
	isAuthenticated: boolean;
	token: string | null;
	alwaysForBadge: boolean;
	messengerTabActive: boolean;
}): boolean {
	return Boolean(
		input.isAuthenticated && input.token && (input.alwaysForBadge || input.messengerTabActive)
	);
}
