import { useCallback, useEffect, useRef } from 'react';

/**
 * Stable emitter so parent pagination state updates without depending on a new
 * `onPageChange` function identity every render (avoids effect loops / stuck totalPages).
 */
export function useStablePaginationEmit(
  onPageChange?: (page: number, totalPages: number) => void
): (page: number, totalPages: number) => void {
  const ref = useRef(onPageChange);
  useEffect(() => {
    ref.current = onPageChange;
  }, [onPageChange]);
  return useCallback((page: number, totalPages: number) => {
    ref.current?.(page, totalPages);
  }, []);
}

export function useSyncedPaginationReport(
  emit: (page: number, totalPages: number) => void,
  clampedPage: number,
  totalPages: number
): void {
  useEffect(() => {
    emit(clampedPage, totalPages);
  }, [clampedPage, totalPages, emit]);
}
