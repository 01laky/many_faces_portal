import { ACL_PERMISSION_KEYS } from './aclPermissionKeys';
import type { MeCapabilities } from './capabilitiesTypes';

export function hasPermission(caps: MeCapabilities | null | undefined, key: string): boolean {
	if (!caps?.permissions?.length) return false;
	return caps.permissions.includes(key);
}

export function canMutateGlobalPageTypes(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.platformPagetypeMutate);
}

export function canPlatformAdmin(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.platformAdmin);
}

export function canSuperAdmin(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.platformSuper);
}

export function hasTenantSession(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.tenantSession);
}

export function hasFaceMember(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.faceMember);
}

export function canUseFaceRoleSelfService(caps: MeCapabilities | null | undefined): boolean {
	return hasPermission(caps, ACL_PERMISSION_KEYS.faceRoleSelfService);
}

/**
 * Parses API JSON safely. Returns null if the payload is not a capabilities object.
 */
export function parseMeCapabilities(raw: unknown): MeCapabilities | null {
	if (!raw || typeof raw !== 'object') return null;
	const o = raw as Record<string, unknown>;

	const globalRole = o.globalRole;
	if (typeof globalRole !== 'string') return null;

	const requestFaceId = o.requestFaceId;
	if (typeof requestFaceId !== 'number' || !Number.isFinite(requestFaceId)) return null;

	const requestFaceIndex = o.requestFaceIndex;
	if (
		requestFaceIndex !== null &&
		requestFaceIndex !== undefined &&
		typeof requestFaceIndex !== 'string'
	)
		return null;

	const isAdminFaceScope = o.isAdminFaceScope;
	if (typeof isAdminFaceScope !== 'boolean') return null;

	const myFaceRoleName = o.myFaceRoleName;
	if (myFaceRoleName !== null && myFaceRoleName !== undefined && typeof myFaceRoleName !== 'string')
		return null;

	const permissions = o.permissions;
	if (!Array.isArray(permissions) || !permissions.every((p) => typeof p === 'string')) return null;

	return {
		globalRole,
		requestFaceId,
		requestFaceIndex: requestFaceIndex ?? null,
		isAdminFaceScope,
		myFaceRoleName: myFaceRoleName ?? null,
		permissions: [...permissions],
	};
}
