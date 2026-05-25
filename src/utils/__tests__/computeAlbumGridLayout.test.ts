/**
 * Layout math for responsive album grids: given container width/height + constraints, assert we never
 * return tiles smaller than `minTilePx`, respect `maxItemsPerPage`, and degrade gracefully for tiny viewports.
 */
import { describe, it, expect } from 'vitest';
import { computeAlbumGridLayout } from '../computeAlbumGridLayout';

const opts = { gap: 6, minTilePx: 100, maxCols: 8, maxRows: 6, maxItemsPerPage: 24 } as const;

describe('computeAlbumGridLayout', () => {
	it('returns null for non-positive dimensions', () => {
		expect(computeAlbumGridLayout(0, 400, opts)).toBeNull();
		expect(computeAlbumGridLayout(400, -1, opts)).toBeNull();
	});

	it('returns 1x1 fallback when container too small for minTilePx', () => {
		const r = computeAlbumGridLayout(50, 50, opts);
		expect(r).not.toBeNull();
		expect(r!.cols).toBe(1);
		expect(r!.rows).toBe(1);
		expect(r!.itemsPerPage).toBe(1);
	});

	it('finds a layout with tile at least minTilePx', () => {
		const r = computeAlbumGridLayout(800, 600, opts);
		expect(r).not.toBeNull();
		expect(r!.tilePx).toBeGreaterThanOrEqual(opts.minTilePx);
		expect(r!.cols * r!.rows).toBe(r!.itemsPerPage);
		expect(r!.itemsPerPage).toBeLessThanOrEqual(opts.maxItemsPerPage);
	});

	it('respects maxItemsPerPage cap', () => {
		const r = computeAlbumGridLayout(2000, 2000, { ...opts, maxItemsPerPage: 8 });
		expect(r!.itemsPerPage).toBeLessThanOrEqual(8);
	});
});
