/**
 * Vitest types-colocation gate — keep aligned with `scripts/verify-portal-types-colocation-tests.mjs`.
 */
export const PORTAL_TYPES_COLOCATION_TEST_FILES = [
	'src/contexts/contextTypes.colocation.edge.test.ts',
	'src/providers/QueryProvider/queryProviderTypes.colocation.edge.test.ts',
	'src/components/radix/Button/buttonTypes.colocation.edge.test.ts',
	'src/pages/LoginPage/loginPageTypes.colocation.edge.test.ts',
	'src/components/Header/headerTypes.colocation.edge.test.ts',
	'src/test/portalTypesColocationCiGate.colocation.edge.test.ts',
] as const;

export const PORTAL_TYPES_COLOCATION_TEST_GLOB = 'src/**/*.colocation.edge.test.ts';
