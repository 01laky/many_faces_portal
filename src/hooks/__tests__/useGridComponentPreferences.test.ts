// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGridComponentPreferences } from '../useGridComponentPreferences';

const getFaceGridSettings = vi.fn();
const updateFaceGridSettings = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'tok', isAuthenticated: true }),
}));

vi.mock('../../api/profile/profileApi', () => ({
  getFaceGridSettings: (...args: unknown[]) => getFaceGridSettings(...args),
  updateFaceGridSettings: (...args: unknown[]) => updateFaceGridSettings(...args),
}));

function memorySession(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
    clear: () => m.clear(),
    get length() {
      return m.size;
    },
    key: () => null,
  } as Storage;
}

describe('useGridComponentPreferences REF-C', () => {
  beforeEach(() => {
    getFaceGridSettings.mockReset();
    updateFaceGridSettings.mockReset();
    getFaceGridSettings.mockResolvedValue({
      gridComponents: { c1: { autoplay: true } },
    });
    updateFaceGridSettings.mockResolvedValue({ gridComponents: {} });
    vi.stubGlobal('sessionStorage', memorySession());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('REF-C1: authed read from API mock', async () => {
    const { result } = renderHook(() => useGridComponentPreferences('c1', 1));
    await waitFor(() => expect(result.current.autoplayEnabled).toBe(true));
    expect(getFaceGridSettings).toHaveBeenCalledWith('tok', 1);
  });

  it('REF-C2: authed debounced PUT on autoplay toggle', async () => {
    const { result } = renderHook(() => useGridComponentPreferences('c1', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setAutoplay(false));
    expect(updateFaceGridSettings).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(updateFaceGridSettings).toHaveBeenCalledWith('tok', 1, {
          gridComponents: { c1: { autoplay: false } },
        }),
      { timeout: 1000 }
    );
  });

  it('REF-C5: face switch loads different prefs key', async () => {
    getFaceGridSettings.mockImplementation((_tok: string, faceId: number) =>
      Promise.resolve({
        gridComponents: { c1: { autoplay: faceId === 2 } },
      })
    );
    const { result, rerender } = renderHook(
      ({ faceId }: { faceId: number }) => useGridComponentPreferences('c1', faceId),
      { initialProps: { faceId: 1 } }
    );
    await waitFor(() => expect(result.current.autoplayEnabled).toBe(false));
    rerender({ faceId: 2 });
    await waitFor(() => expect(result.current.autoplayEnabled).toBe(true));
    expect(getFaceGridSettings).toHaveBeenLastCalledWith('tok', 2);
  });
});

describe('useGridComponentPreferences guest REF-C3', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('sessionStorage', memorySession());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('REF-C3: guest sessionStorage only', async () => {
    vi.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({ token: null, isAuthenticated: false }),
    }));
    const { useGridComponentPreferences: guestHook } =
      await import('../useGridComponentPreferences');
    const { result } = renderHook(() => guestHook('guest-c', null));
    act(() => result.current.setAutoplay(true));
    expect(result.current.autoplayEnabled).toBe(true);
    expect(sessionStorage.getItem('component-settings-guest-c')).toContain('autoplay');
  });
});
