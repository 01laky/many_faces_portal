import { describe, expect, it } from 'vitest';
import { computeFillGridItems } from '../computeFillGridItems';

describe('computeFillGridItems', () => {
	it('returns minimum 1x1 when width or height is non-positive', () => {
		expect(computeFillGridItems(0, 100, { gap: 8, minColWidth: 120 })).toEqual({
			cols: 1,
			rows: 1,
			itemsPerPage: 1,
		});
		expect(computeFillGridItems(200, 0, { gap: 8, minColWidth: 120 })).toEqual({
			cols: 1,
			rows: 1,
			itemsPerPage: 1,
		});
	});

	it('subtracts reserveBottomPx from usable height', () => {
		const full = computeFillGridItems(400, 300, { gap: 10, minColWidth: 100 });
		const reserved = computeFillGridItems(400, 300, {
			gap: 10,
			minColWidth: 100,
			reserveBottomPx: 80,
		});
		expect(reserved.itemsPerPage).toBeLessThanOrEqual(full.itemsPerPage);
	});

	it('uses fixedCardHeightPx when provided', () => {
		const result = computeFillGridItems(320, 400, {
			gap: 8,
			minColWidth: 80,
			fixedCardHeightPx: 200,
		});
		expect(result.cols).toBeGreaterThanOrEqual(1);
		expect(result.itemsPerPage).toBe(result.cols * result.rows);
	});

	it('scales itemsPerPage with wider containers', () => {
		const narrow = computeFillGridItems(200, 400, { gap: 8, minColWidth: 120 });
		const wide = computeFillGridItems(800, 400, { gap: 8, minColWidth: 120 });
		expect(wide.itemsPerPage).toBeGreaterThan(narrow.itemsPerPage);
	});
});
