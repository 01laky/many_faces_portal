#!/usr/bin/env node
/**
 * CI helper: run required portal types/enums/constants colocation regression tests.
 *
 * Usage from many_faces_portal root:
 *   node scripts/verify-portal-types-colocation-tests.mjs
 *
 * File list must stay aligned with:
 *   src/test/portalTypesColocationCiGate.ts
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const portal = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gatePath = path.join(portal, 'src/test/portalTypesColocationCiGate.ts');
const gateSource = readFileSync(gatePath, 'utf8');

const listed = [...gateSource.matchAll(/'([^']+\.colocation\.edge\.test\.ts)'/g)].map((m) => m[1]);

if (listed.length === 0) {
	console.error('No colocation edge test paths found in portalTypesColocationCiGate.ts');
	process.exit(1);
}

const result = spawnSync('yarn', ['vitest', 'run', ...listed], {
	cwd: portal,
	stdio: 'inherit',
});

process.exit(result.status ?? 1);
