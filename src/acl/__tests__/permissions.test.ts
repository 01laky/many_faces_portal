/**
 * Regression tests for ACL parsing (`parseMeCapabilities`) and helper predicates used by route guards.
 * Keeps **many_faces_portal** `permissions.ts` aligned with backend `GET /api/me/capabilities` JSON (security hardening).
 */
import { describe, expect, it } from 'vitest';
import { ACL_PERMISSION_KEYS, ALL_ACL_PERMISSION_KEYS_SORTED } from '../aclPermissionKeys';
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

/**
 * Edge cases for GET /api/me/capabilities parsing and permission helpers (security-hardening prompt).
 */
describe('parseMeCapabilities', () => {
	it('returns null for non-object payloads', () => {
		expect(parseMeCapabilities(null)).toBeNull();
		expect(parseMeCapabilities(undefined)).toBeNull();
		expect(parseMeCapabilities('x')).toBeNull();
		expect(parseMeCapabilities(1)).toBeNull();
	});

	it('returns null when required fields are wrong types', () => {
		expect(parseMeCapabilities({ globalRole: 1 })).toBeNull();
		expect(parseMeCapabilities({ globalRole: 'USER', requestFaceId: 'n' })).toBeNull();
		expect(
			parseMeCapabilities({ globalRole: 'USER', requestFaceId: 1, isAdminFaceScope: 'x' })
		).toBeNull();
		expect(
			parseMeCapabilities({
				globalRole: 'USER',
				requestFaceId: 1,
				requestFaceIndex: 2,
				isAdminFaceScope: false,
				permissions: [],
			})
		).toBeNull();
		expect(
			parseMeCapabilities({
				globalRole: 'USER',
				requestFaceId: 1,
				requestFaceIndex: null,
				isAdminFaceScope: false,
				myFaceRoleName: 1,
				permissions: [],
			})
		).toBeNull();
		expect(
			parseMeCapabilities({
				globalRole: 'USER',
				requestFaceId: 1,
				requestFaceIndex: null,
				isAdminFaceScope: false,
				myFaceRoleName: null,
				permissions: [1],
			})
		).toBeNull();
	});

	it('accepts valid payloads and normalizes null optional fields', () => {
		const caps = parseMeCapabilities({
			globalRole: 'USER',
			requestFaceId: 3,
			requestFaceIndex: null,
			isAdminFaceScope: false,
			myFaceRoleName: null,
			permissions: ['a', 'b'],
		});
		expect(caps).toEqual({
			globalRole: 'USER',
			requestFaceId: 3,
			requestFaceIndex: null,
			isAdminFaceScope: false,
			myFaceRoleName: null,
			permissions: ['a', 'b'],
		});
	});

	it('copies permissions array defensively', () => {
		const raw = {
			globalRole: 'ADMIN',
			requestFaceId: 1,
			requestFaceIndex: 'public',
			isAdminFaceScope: true,
			myFaceRoleName: 'FACE_HOST',
			permissions: ['p'],
		};
		const caps = parseMeCapabilities(raw)!;
		caps.permissions.push('mutated');
		expect(raw.permissions).toEqual(['p']);
	});
});

describe('permission helpers', () => {
	const base = parseMeCapabilities({
		globalRole: 'USER',
		requestFaceId: 1,
		requestFaceIndex: 'public',
		isAdminFaceScope: false,
		myFaceRoleName: null,
		permissions: [ACL_PERMISSION_KEYS.tenantSession, ACL_PERMISSION_KEYS.faceMember],
	})!;

	it('hasPermission is false for missing keys', () => {
		expect(hasPermission(base, ACL_PERMISSION_KEYS.platformSuper)).toBe(false);
		expect(hasPermission(null, ACL_PERMISSION_KEYS.tenantSession)).toBe(false);
		expect(hasPermission({ ...base, permissions: [] }, ACL_PERMISSION_KEYS.tenantSession)).toBe(
			false
		);
	});

	it('maps capability helpers to keys', () => {
		expect(hasTenantSession(base)).toBe(true);
		expect(hasFaceMember(base)).toBe(true);
		expect(canSuperAdmin(base)).toBe(false);
		expect(canPlatformAdmin(base)).toBe(false);
		expect(canMutateGlobalPageTypes(base)).toBe(false);
		expect(canUseFaceRoleSelfService(base)).toBe(false);
	});
});

describe('ACL catalog vs /api/me/capabilities', () => {
	const baseFields = {
		globalRole: 'USER',
		requestFaceId: 1,
		requestFaceIndex: 'public' as const,
		isAdminFaceScope: false,
		myFaceRoleName: null as string | null,
	};

	it.each(ALL_ACL_PERMISSION_KEYS_SORTED)('accepts permission key %s in payload', (key) => {
		const caps = parseMeCapabilities({
			...baseFields,
			permissions: [key],
		});
		expect(caps).not.toBeNull();
		expect(hasPermission(caps, key)).toBe(true);
	});
});
