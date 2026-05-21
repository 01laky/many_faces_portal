import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  GRADIENT_ANIMATION_STORAGE_KEY,
  readGuestGradientAnimationEnabled,
  writeGuestGradientAnimationEnabled,
} from '../gradientAnimationPreferenceStorage';

describe('gradientAnimationPreferenceStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readGuestGradientAnimationEnabled()).toBe(false);
    expect(() => writeGuestGradientAnimationEnabled(true)).not.toThrow();
  });

  it('persists guest preference as 1/0', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    });
    writeGuestGradientAnimationEnabled(true);
    expect(store.get(GRADIENT_ANIMATION_STORAGE_KEY)).toBe('1');
    expect(readGuestGradientAnimationEnabled()).toBe(true);
    writeGuestGradientAnimationEnabled(false);
    expect(readGuestGradientAnimationEnabled()).toBe(false);
  });
});
