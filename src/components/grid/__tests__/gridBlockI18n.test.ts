import { describe, expect, it } from 'vitest';
import { gridBlockI18nKeys } from '../gridBlockI18n';

function collectKeyStrings(obj: Record<string, unknown>): string[] {
  const keys: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      keys.push(value);
    } else if (value && typeof value === 'object') {
      keys.push(...collectKeyStrings(value as Record<string, unknown>));
    }
  }
  return keys;
}

describe('gridBlockI18nKeys', () => {
  it('uses gridBlocks namespace prefix for every key', () => {
    const all = collectKeyStrings(gridBlockI18nKeys as unknown as Record<string, unknown>);
    expect(all.length).toBeGreaterThan(20);
    for (const key of all) {
      expect(key.startsWith('gridBlocks.')).toBe(true);
    }
  });
});
