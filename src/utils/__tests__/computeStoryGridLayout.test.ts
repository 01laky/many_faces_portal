import { describe, it, expect } from 'vitest';
import { computeStoryGridLayout } from '../computeStoryGridLayout';

const gap = 8;
const labelPx = 22;

describe('computeStoryGridLayout', () => {
	it('prefers more slots when thumb still meets minimum', () => {
		const r = computeStoryGridLayout(900, 520, {
			gap,
			minThumbWidthPx: 48,
			labelPx,
			maxCols: 12,
			maxRows: 12,
		});
		expect(r).not.toBeNull();
		expect(r!.cols).toBeGreaterThanOrEqual(3);
		expect(r!.thumbW).toBeGreaterThanOrEqual(48);
		expect(r!.itemsPerPage).toBe(r!.cols * r!.rows);
	});

	it('keeps 1:2 thumb + label within each cell', () => {
		const r = computeStoryGridLayout(640, 400, {
			gap,
			minThumbWidthPx: 40,
			labelPx,
			maxCols: 8,
			maxRows: 8,
		});
		expect(r).not.toBeNull();
		const { cols, rows, thumbW } = r!;
		const cellW = (640 - (cols - 1) * gap) / cols;
		const cellH = (400 - (rows - 1) * gap) / rows;
		expect(thumbW).toBeLessThanOrEqual(cellW + 0.01);
		expect(2 * thumbW + labelPx).toBeLessThanOrEqual(cellH + 1);
	});

	it('returns 1×1 fallback when box is very small', () => {
		const r = computeStoryGridLayout(40, 40, { gap: 0, minThumbWidthPx: 200, labelPx: 20 });
		expect(r).not.toBeNull();
		expect(r!.cols).toBe(1);
		expect(r!.rows).toBe(1);
	});
});
