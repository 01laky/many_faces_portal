import { describe, expect, it } from 'vitest';
import { ACL_PERMISSION_KEYS } from '../aclPermissionKeys';
import type { MeCapabilities } from '../capabilitiesTypes';
import {
  canMutateGlobalPageTypes,
  canPlatformAdmin,
  canSuperAdmin,
  canUseFaceRoleSelfService,
  hasFaceMember,
  hasPermission,
  hasTenantSession,
  parseMeCapabilities,
} from '../permissions';

function caps(partial: Partial<MeCapabilities>): MeCapabilities {
  return {
    globalRole: partial.globalRole ?? 'USER',
    requestFaceId: partial.requestFaceId ?? 1,
    requestFaceIndex: partial.requestFaceIndex ?? 'public',
    isAdminFaceScope: partial.isAdminFaceScope ?? false,
    myFaceRoleName: partial.myFaceRoleName ?? null,
    permissions: partial.permissions ?? [],
  };
}

describe('hasPermission', () => {
  it('returns false for null, undefined, or empty permissions', () => {
    expect(hasPermission(null, ACL_PERMISSION_KEYS.tenantSession)).toBe(false);
    expect(hasPermission(undefined, ACL_PERMISSION_KEYS.tenantSession)).toBe(false);
    expect(hasPermission(caps({ permissions: [] }), ACL_PERMISSION_KEYS.tenantSession)).toBe(false);
  });

  it('is exact string match (no substring / case folding)', () => {
    const c = caps({ permissions: ['tenant:session', 'face:member'] });
    expect(hasPermission(c, ACL_PERMISSION_KEYS.tenantSession)).toBe(true);
    expect(hasPermission(c, 'TENANT:SESSION')).toBe(false);
    expect(hasPermission(c, 'tenant')).toBe(false);
  });
});

describe('capability helpers', () => {
  it('maps platform pagetype flag', () => {
    expect(
      canMutateGlobalPageTypes(caps({ permissions: [ACL_PERMISSION_KEYS.platformPagetypeMutate] }))
    ).toBe(true);
    expect(
      canMutateGlobalPageTypes(caps({ permissions: [ACL_PERMISSION_KEYS.platformAdmin] }))
    ).toBe(false);
  });

  it('maps admin / super / tenant / face self-service', () => {
    expect(canPlatformAdmin(caps({ permissions: [ACL_PERMISSION_KEYS.platformAdmin] }))).toBe(true);
    expect(canSuperAdmin(caps({ permissions: [ACL_PERMISSION_KEYS.platformSuper] }))).toBe(true);
    expect(hasTenantSession(caps({ permissions: [ACL_PERMISSION_KEYS.tenantSession] }))).toBe(true);
    expect(hasFaceMember(caps({ permissions: [ACL_PERMISSION_KEYS.faceMember] }))).toBe(true);
    expect(
      canUseFaceRoleSelfService(caps({ permissions: [ACL_PERMISSION_KEYS.faceRoleSelfService] }))
    ).toBe(true);
  });
});

describe('parseMeCapabilities', () => {
  it('returns null for non-objects and malformed payloads', () => {
    expect(parseMeCapabilities(null)).toBeNull();
    expect(parseMeCapabilities(undefined)).toBeNull();
    expect(parseMeCapabilities('x')).toBeNull();
    expect(parseMeCapabilities([])).toBeNull();
    expect(parseMeCapabilities({})).toBeNull();
    expect(parseMeCapabilities({ globalRole: 1 })).toBeNull();
    expect(parseMeCapabilities({ globalRole: 'USER', requestFaceId: '1' })).toBeNull();
    expect(
      parseMeCapabilities({ globalRole: 'USER', requestFaceId: 1, isAdminFaceScope: 'yes' })
    ).toBeNull();
    expect(
      parseMeCapabilities({
        globalRole: 'USER',
        requestFaceId: 1,
        isAdminFaceScope: false,
        permissions: [1],
      })
    ).toBeNull();
  });

  it('accepts null requestFaceIndex and myFaceRoleName', () => {
    const parsed = parseMeCapabilities({
      globalRole: 'USER',
      requestFaceId: 2,
      requestFaceIndex: null,
      isAdminFaceScope: false,
      myFaceRoleName: null,
      permissions: ['tenant:session'],
    });
    expect(parsed).toEqual({
      globalRole: 'USER',
      requestFaceId: 2,
      requestFaceIndex: null,
      isAdminFaceScope: false,
      myFaceRoleName: null,
      permissions: ['tenant:session'],
    });
  });

  it('copies permissions array (mutating result does not affect input)', () => {
    const perms = ['tenant:session'];
    const parsed = parseMeCapabilities({
      globalRole: 'USER',
      requestFaceId: 1,
      requestFaceIndex: 'public',
      isAdminFaceScope: false,
      myFaceRoleName: null,
      permissions: perms,
    });
    expect(parsed).not.toBeNull();
    parsed!.permissions.push('x');
    expect(perms).toEqual(['tenant:session']);
  });

  it('accepts duplicate permission strings in payload (helpers still work)', () => {
    const parsed = parseMeCapabilities({
      globalRole: 'USER',
      requestFaceId: 1,
      requestFaceIndex: 'public',
      isAdminFaceScope: false,
      myFaceRoleName: null,
      permissions: ['tenant:session', 'tenant:session', 'face:member'],
    });
    expect(parsed!.permissions).toHaveLength(3);
    expect(hasTenantSession(parsed)).toBe(true);
  });

  it('treats extra unknown permission strings as opaque', () => {
    const c = caps({ permissions: ['tenant:session', 'future:capability'] });
    expect(hasPermission(c, 'future:capability')).toBe(true);
    expect(canMutateGlobalPageTypes(c)).toBe(false);
  });
});
