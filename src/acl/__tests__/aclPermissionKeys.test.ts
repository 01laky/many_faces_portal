import { describe, expect, it } from 'vitest';
import { ACL_PERMISSION_KEYS, ALL_ACL_PERMISSION_KEYS_SORTED } from '../aclPermissionKeys';

describe('ACL_PERMISSION_KEYS', () => {
	it('matches the backend AclPermissionKeys catalog exactly', () => {
		expect(ACL_PERMISSION_KEYS.platformSuper).toBe('platform:super');
		expect(ACL_PERMISSION_KEYS.platformAdmin).toBe('platform:admin');
		expect(ACL_PERMISSION_KEYS.platformPagetypeMutate).toBe('platform:pagetype:mutate');
		expect(ACL_PERMISSION_KEYS.tenantSession).toBe('tenant:session');
		expect(ACL_PERMISSION_KEYS.faceMember).toBe('face:member');
		expect(ACL_PERMISSION_KEYS.faceRoleSelfService).toBe('face:role:self-service');
	});

	it('exposes a stable sorted list of all known keys (no duplicates)', () => {
		const set = new Set(ALL_ACL_PERMISSION_KEYS_SORTED);
		expect(set.size).toBe(ALL_ACL_PERMISSION_KEYS_SORTED.length);
		const sorted = [...ALL_ACL_PERMISSION_KEYS_SORTED].sort((a, b) => a.localeCompare(b));
		expect(ALL_ACL_PERMISSION_KEYS_SORTED).toEqual(sorted);
	});
});
