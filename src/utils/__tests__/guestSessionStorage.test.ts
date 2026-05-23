import { describe, it, expect, vi, afterEach } from 'vitest';
import { readGuestUiLanguage, writeGuestUiLanguage } from '../guestSessionStorage';

function memorySession(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial));
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

describe('guestSessionStorage REF-G', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('REF-G1: read/write locale roundtrip', () => {
    const session = memorySession();
    writeGuestUiLanguage('sk', session);
    expect(readGuestUiLanguage(session)).toBe('sk');
  });

  it('REF-G2: invalid locale ignored', () => {
    const session = memorySession({ 'mfai.guestUiLanguage': 'xx' });
    expect(readGuestUiLanguage(session)).toBeNull();
  });

  it('REF-G3: gradient flag 1/0 via re-export', async () => {
    const { readGuestGradientAnimationEnabled, writeGuestGradientAnimationEnabled } =
      await import('../guestSessionStorage');
    const session = memorySession();
    writeGuestGradientAnimationEnabled(true, session);
    expect(readGuestGradientAnimationEnabled(session)).toBe(true);
    writeGuestGradientAnimationEnabled(false, session);
    expect(readGuestGradientAnimationEnabled(session)).toBe(false);
  });

  it('REF-G4: SSR / undefined window → safe defaults', () => {
    vi.stubGlobal('sessionStorage', undefined);
    expect(readGuestUiLanguage(undefined as unknown as Storage)).toBeNull();
    expect(() => writeGuestUiLanguage('en', undefined as unknown as Storage)).not.toThrow();
  });
});
