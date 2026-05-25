import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON } from '../defaultProfileDetailSchema';
import { parseProfileDetailGridSchema } from '../parseProfileDetailGridSchema';

describe('parseProfileDetailGridSchema', () => {
	it('accepts default seed JSON', () => {
		const result = parseProfileDetailGridSchema(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA_JSON);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.schema.items.length).toBeGreaterThan(0);
			expect(result.schema.schemaVersion).toBe(1);
		}
	});

	it('falls back to default when json is empty', () => {
		const result = parseProfileDetailGridSchema(null);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.schema.items.some((i) => i.sectionType === 'profileHero')).toBe(true);
		}
	});

	it('rejects invalid json', () => {
		const result = parseProfileDetailGridSchema('{not json');
		expect(result.ok).toBe(false);
	});

	it('rejects unknown section types', () => {
		const result = parseProfileDetailGridSchema(
			'{"items":[{"i":"x","sectionType":"albumGrid"}],"rowHeight":80,"breakpoints":{},"cols":{}}'
		);
		expect(result.ok).toBe(false);
	});

	it('strips legacy profileBackNav sections', () => {
		const result = parseProfileDetailGridSchema(
			'{"items":[{"i":"back","sectionType":"profileBackNav"},{"i":"hero","sectionType":"profileHero","x":0,"y":0,"w":12,"h":4}],"rowHeight":80,"breakpoints":{},"cols":{}}'
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.schema.items.some((i) => i.sectionType === 'profileBackNav')).toBe(false);
			expect(result.schema.items.some((i) => i.sectionType === 'profileHero')).toBe(true);
		}
	});

	it('rejects duplicate item ids', () => {
		const result = parseProfileDetailGridSchema(
			'{"items":[{"i":"a","sectionType":"spacer","x":0,"y":0,"w":1,"h":1},{"i":"a","sectionType":"spacer","x":1,"y":0,"w":1,"h":1}],"rowHeight":80,"breakpoints":{},"cols":{}}'
		);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toBe('duplicate_item_id');
	});

	it('rejects invalid root and missing items', () => {
		expect(parseProfileDetailGridSchema('[]')).toMatchObject({ ok: false, error: 'invalid_root' });
		expect(parseProfileDetailGridSchema('{"rowHeight":80}')).toMatchObject({
			ok: false,
			error: 'missing_items',
		});
	});

	it('rejects invalid item shape and empty item id', () => {
		expect(
			parseProfileDetailGridSchema('{"items":[null],"rowHeight":80,"breakpoints":{},"cols":{}}')
		).toMatchObject({ ok: false, error: 'invalid_item' });
		expect(
			parseProfileDetailGridSchema(
				'{"items":[{"i":"","sectionType":"spacer"}],"rowHeight":80,"breakpoints":{},"cols":{}}'
			)
		).toMatchObject({ ok: false, error: 'missing_item_id' });
	});

	it('accepts empty items after stripping only profileBackNav', () => {
		const result = parseProfileDetailGridSchema(
			'{"items":[{"i":"back","sectionType":"profileBackNav"}],"rowHeight":80,"breakpoints":{},"cols":{}}'
		);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.schema.items).toHaveLength(0);
	});

	it('fills defaults for breakpoints, cols, and schemaVersion', () => {
		const result = parseProfileDetailGridSchema(
			'{"items":[{"i":"s","sectionType":"spacer","x":0,"y":0,"w":1,"h":1}],"rowHeight":90}'
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.schema.rowHeight).toBe(90);
			expect(result.schema.schemaVersion).toBe(1);
			expect(result.schema.breakpoints.lg).toBeGreaterThan(0);
			expect(result.schema.cols.lg).toBeGreaterThan(0);
		}
	});
});
