/** Pure dispatch for unified component detail route (PT-RP6). */
export type ComponentDetailDispatch = 'invalid' | 'chatRoom' | 'videoLounge' | 'unsupported';

export function resolveComponentDetailDispatch(
	typeId: number,
	entityId: number
): ComponentDetailDispatch {
	if (!Number.isFinite(typeId) || !Number.isFinite(entityId)) return 'invalid';
	if (typeId === 4) return 'chatRoom';
	if (typeId === 8) return 'videoLounge';
	return 'unsupported';
}
