import { describe, it, expect } from 'vitest';
import { computeAlbumGridLayout } from '../computeAlbumGridLayout';

const gap = 6;

describe('computeAlbumGridLayout', () => {
  it('prefers more slots when tile size still meets minimum', () => {
    const r = computeAlbumGridLayout(900, 520, {
      gap,
      minTilePx: 80,
      maxCols: 12,
      maxRows: 12,
    });
    expect(r).not.toBeNull();
    expect(r!.cols).toBeGreaterThanOrEqual(4);
    expect(r!.tilePx).toBeGreaterThanOrEqual(80);
    expect(r!.itemsPerPage).toBe(r!.cols * r!.rows);
  });

  it('keeps square tiles within container (no overflow math)', () => {
    const r = computeAlbumGridLayout(640, 400, {
      gap,
      minTilePx: 72,
      maxCols: 8,
      maxRows: 6,
    });
    expect(r).not.toBeNull();
    const { cols, rows, tilePx } = r!;
    const usedW = cols * tilePx + (cols - 1) * gap;
    const usedH = rows * tilePx + (rows - 1) * gap;
    expect(usedW).toBeLessThanOrEqual(640);
    expect(usedH).toBeLessThanOrEqual(400);
  });

  it('returns 1x1 fallback when box is too small for min tile', () => {
    const r = computeAlbumGridLayout(40, 40, { gap: 0, minTilePx: 200 });
    expect(r).not.toBeNull();
    expect(r!.cols).toBe(1);
    expect(r!.rows).toBe(1);
  });
});
