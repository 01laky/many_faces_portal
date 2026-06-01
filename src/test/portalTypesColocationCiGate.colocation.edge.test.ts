import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	PORTAL_TYPES_COLOCATION_TEST_FILES,
	PORTAL_TYPES_COLOCATION_TEST_GLOB,
} from './portalTypesColocationCiGate';

const portalRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function walkColocationTests(dir: string, acc: string[] = []): string[] {
	for (const ent of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) walkColocationTests(full, acc);
		else if (ent.name.endsWith('.colocation.edge.test.ts')) {
			acc.push(path.relative(portalRoot, full).split(path.sep).join('/'));
		}
	}
	return acc;
}

describe('portalTypesColocationCiGate alignment', () => {
	it('exports non-empty explicit file list and glob', () => {
		expect(PORTAL_TYPES_COLOCATION_TEST_FILES.length).toBeGreaterThan(0);
		expect(PORTAL_TYPES_COLOCATION_TEST_GLOB).toBe('src/**/*.colocation.edge.test.ts');
	});

	it('lists only existing colocation edge test files', () => {
		for (const rel of PORTAL_TYPES_COLOCATION_TEST_FILES) {
			const full = path.join(portalRoot, rel);
			expect(statSync(full).isFile()).toBe(true);
		}
	});

	it('verify script reads paths from portalTypesColocationCiGate.ts', () => {
		const scriptCandidates = [
			path.join(portalRoot, 'scripts/verify-portal-types-colocation-tests.mjs'),
			path.join(portalRoot, '../scripts/verify-portal-types-colocation-tests.mjs'),
		];
		const scriptPath = scriptCandidates.find((candidate) => existsSync(candidate));
		expect(scriptPath).toBeDefined();
		const script = readFileSync(scriptPath!, 'utf8');
		expect(script).toContain('portalTypesColocationCiGate.ts');
		expect(script).toContain('matchAll');
	});

	it('includes every *.colocation.edge.test.ts under src/', () => {
		const discovered = walkColocationTests(path.join(portalRoot, 'src')).sort();
		const listed = [...PORTAL_TYPES_COLOCATION_TEST_FILES].sort();
		expect(listed).toEqual(discovered);
	});
});
