/**
 * Pure helpers backing `useWallHostViewer`: ensures we derive host/non-host wall UX flags from API meta
 * without React, including **null** host state when the fetch rejects (unknown vs explicit boolean).
 */
import { describe, it, expect, vi } from 'vitest';
import { loadWallHostViewerFlag, computeCanShowWallCreate } from '../wallHostViewerLogic';

describe('wallHostViewerLogic', () => {
  it('loadWallHostViewerFlag returns isHostViewer from API', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ isHostViewer: true });
    await expect(loadWallHostViewerFlag(fetchPage, 't', 1)).resolves.toBe(true);
    expect(fetchPage).toHaveBeenCalledWith('t', 1, 1, 1);
  });

  it('loadWallHostViewerFlag returns null on rejection', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('network'));
    await expect(loadWallHostViewerFlag(fetchPage, 't', 1)).resolves.toBeNull();
  });

  it('computeCanShowWallCreate is true only when guest-like host flag', () => {
    expect(computeCanShowWallCreate(true, 'tok', 1, false)).toBe(true);
    expect(computeCanShowWallCreate(true, 'tok', 1, true)).toBe(false);
    expect(computeCanShowWallCreate(true, 'tok', 1, null)).toBe(false);
    expect(computeCanShowWallCreate(false, 'tok', 1, false)).toBe(false);
    expect(computeCanShowWallCreate(true, null, 1, false)).toBe(false);
    expect(computeCanShowWallCreate(true, 'tok', undefined, false)).toBe(false);
  });
});
