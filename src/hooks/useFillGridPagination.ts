import { useState, useCallback, useLayoutEffect, type RefObject } from 'react';
import { computeFillGridItems } from '../utils/computeFillGridItems';

export type FillGridLayoutParams = {
  gap: number;
  minColWidth: number;
  fixedCardHeightPx?: number;
  imageHeightFromCellWidth?: number;
  infoBlockPx?: number;
};

/**
 * Measures the grid items container and sets itemsPerPage + column count for CSS variables.
 * When pagination lives in the parent (controlled), do not reserve space for internal pagination.
 */
export function useFillGridPagination(
  itemsRef: RefObject<HTMLDivElement | null>,
  observe: boolean,
  isControlled: boolean,
  layout: FillGridLayoutParams,
  reserveInternalPaginationPx = 32
): { itemsPerPage: number; gridCols: number } {
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [gridCols, setGridCols] = useState(4);

  const { gap, minColWidth, fixedCardHeightPx, imageHeightFromCellWidth, infoBlockPx } = layout;

  const calcItems = useCallback(() => {
    const el = itemsRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    const reserveBottomPx = isControlled ? 0 : reserveInternalPaginationPx;
    const { cols, itemsPerPage: ipp } = computeFillGridItems(clientWidth, clientHeight, {
      gap,
      minColWidth,
      reserveBottomPx,
      fixedCardHeightPx,
      imageHeightFromCellWidth,
      infoBlockPx,
    });
    setGridCols(cols);
    setItemsPerPage(ipp);
  }, [
    itemsRef,
    gap,
    minColWidth,
    fixedCardHeightPx,
    imageHeightFromCellWidth,
    infoBlockPx,
    isControlled,
    reserveInternalPaginationPx,
  ]);

  useLayoutEffect(() => {
    if (!observe) return;
    calcItems();
    const el = itemsRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcItems());
    ro.observe(el);
    return () => ro.disconnect();
  }, [observe, calcItems, itemsRef]);

  return { itemsPerPage, gridCols };
}
