/** Pure hub gating helpers (PSH1-C2…C4). */

export function shouldConnectMessengerHub(input: {
	isAuthenticated: boolean;
	token: string | null;
}): boolean {
	return Boolean(input.isAuthenticated && input.token);
}

export function shouldConnectChatRoomHub(input: {
	token: string | null;
	isMember: boolean;
	isHostViewer: boolean;
}): boolean {
	if (!input.token) return false;
	if (input.isHostViewer) return false;
	return input.isMember;
}

export function shouldConnectAiChatHub(input: {
	token: string | null;
	aiGloballyEnabled: boolean;
}): boolean {
	if (!input.token) return false;
	return input.aiGloballyEnabled;
}
