/**
 * Must stay in sync with BeDemo.Api.Security.AclPermissionKeys (canonical ACL strings).
 */
export const ACL_PERMISSION_KEYS = {
	platformSuper: 'platform:super',
	platformAdmin: 'platform:admin',
	platformPagetypeMutate: 'platform:pagetype:mutate',
	tenantSession: 'tenant:session',
	faceMember: 'face:member',
	faceRoleSelfService: 'face:role:self-service',
} as const;

export type AclPermissionKey = (typeof ACL_PERMISSION_KEYS)[keyof typeof ACL_PERMISSION_KEYS];

/** Sorted list for strict contract tests against the backend catalog. */
export const ALL_ACL_PERMISSION_KEYS_SORTED: readonly string[] = [
	ACL_PERMISSION_KEYS.faceMember,
	ACL_PERMISSION_KEYS.faceRoleSelfService,
	ACL_PERMISSION_KEYS.platformAdmin,
	ACL_PERMISSION_KEYS.platformPagetypeMutate,
	ACL_PERMISSION_KEYS.platformSuper,
	ACL_PERMISSION_KEYS.tenantSession,
];
