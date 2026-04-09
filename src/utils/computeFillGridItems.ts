/**
 * Compute how many grid cards fit in a box so pagination matches the CSS grid.
 * Uses the same column formula as repeat(auto-fill, minmax(minCol, 1fr)) with gap.
 */

export type ComputeFillGridItemsOptions = {
  gap: number;
  minColWidth: number;
  reserveBottomPx?: number;
  /**
   * If set, each row is this tall (plus gap). Use for cards whose height does not scale with column width.
   */
  fixedCardHeightPx?: number;
  /** Image area height = cellWidth * this (e.g. 1 for 1:1, 16/9 for 9:16 portrait). Ignored if fixedCardHeightPx is set. */
  imageHeightFromCellWidth?: number;
  /** Text / chrome below the image area. Ignored if fixedCardHeightPx is set. */
  infoBlockPx?: number;
};

export function computeFillGridItems(
  width: number,
  height: number,
  opts: ComputeFillGridItemsOptions
): { cols: number; rows: number; itemsPerPage: number } {
  const {
    gap,
    minColWidth,
    reserveBottomPx = 0,
    fixedCardHeightPx,
    imageHeightFromCellWidth = 1,
    infoBlockPx = 0,
  } = opts;
  const h = height - reserveBottomPx;
  if (width <= 0 || h <= 0) {
    return { cols: 1, rows: 1, itemsPerPage: 1 };
  }
  const cols = Math.max(1, Math.floor((width + gap) / (minColWidth + gap)));
  const cellW = (width - gap * Math.max(0, cols - 1)) / cols;
  const cardH = fixedCardHeightPx ?? cellW * imageHeightFromCellWidth + infoBlockPx;
  // Equal-height rows (e.g. grid-auto-rows: 1fr): each track must be >= cardH.
  let rows = 1;
  const maxR = Math.max(1, Math.ceil(h / cardH));
  for (let r = maxR; r >= 1; r--) {
    const trackH = (h - gap * Math.max(0, r - 1)) / r;
    if (trackH >= cardH - 0.25) {
      rows = r;
      break;
    }
  }
  return { cols, rows, itemsPerPage: cols * rows };
}
