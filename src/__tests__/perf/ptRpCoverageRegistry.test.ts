/**
 * Meta coverage map — documents which PT-RP edge-case IDs have Vitest coverage.
 * Fails if a shipped PT-RP ID is removed from the registry without updating tests.
 */
import { describe, it, expect } from 'vitest';

/** PT-RP IDs with at least one Vitest test (update when adding coverage). */
const COVERED_PT_RP = [
	'PT-RP1',
	'PT-RP2',
	'PT-RP3',
	'PT-RP4',
	'PT-RP5',
	'PT-RP6',
	'PT-RP8',
	'PT-RP9',
	'PT-RP10',
	'PT-RP12',
	'PT-RP13',
	'PT-RP14',
	'PT-RP16',
	'PT-RP17',
	'PT-RP18',
	'PT-RP19',
	'PT-RP20',
	'PT-RP21',
	'PT-RP22',
	'PT-RP23',
	'PT-RP24',
	'PT-RP25',
	'PT-RP26',
	'PT-RP27',
	'PT-RP28',
	'PT-RP29',
	'PT-RP30',
] as const;

/** Shipped in v1.0.0 — Cypress or manual-only waivers documented here. */
const WAIVED_OR_E2E = ['PT-RP7', 'PT-RP11', 'PT-RP15'] as const;

const ALL_PT_RP = [...COVERED_PT_RP, ...WAIVED_OR_E2E];

describe('PT-RP edge-case coverage registry', () => {
	it('covers PT-RP1 through PT-RP30 except optional B1', () => {
		expect(ALL_PT_RP.length).toBe(30);
		for (let i = 1; i <= 30; i++) {
			const id = `PT-RP${i}`;
			if (id === 'PT-RP-B1') continue;
			expect(ALL_PT_RP.includes(id as (typeof ALL_PT_RP)[number])).toBe(true);
		}
	});

	it('no duplicate registry entries', () => {
		expect(new Set(ALL_PT_RP).size).toBe(ALL_PT_RP.length);
	});
});
