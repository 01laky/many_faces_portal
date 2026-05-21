import { describe, expect, it, vi } from 'vitest';
import {
  advanceCarouselPage,
  parsePageGridSchema,
  readComponentBlockAutoplay,
  COMPONENT_SETTINGS_STORAGE_PREFIX,
} from '../pageGridSchema';

const validSchema = JSON.stringify({
  items: [{ i: 'a', x: 0, y: 0, w: 4, h: 2, componentType: 'blog' }],
  breakpoints: { lg: 1200 },
  cols: { lg: 12 },
  rowHeight: 80,
});

describe('parsePageGridSchema', () => {
  it('parses valid grid JSON', () => {
    const schema = parsePageGridSchema(validSchema);
    expect(schema?.items).toHaveLength(1);
    expect(schema?.items[0].componentType).toBe('blog');
  });

  it('returns null for invalid JSON', () => {
    expect(parsePageGridSchema('{bad')).toBeNull();
  });

  it('returns null when items array is empty', () => {
    expect(parsePageGridSchema('{"items":[]}')).toBeNull();
  });

  it('returns null when items are missing', () => {
    expect(parsePageGridSchema('{"rowHeight":80}')).toBeNull();
  });
});

describe('readComponentBlockAutoplay', () => {
  it('returns false when storage is unavailable', () => {
    expect(readComponentBlockAutoplay('block-1', undefined)).toBe(false);
  });

  it('reads autoplay flag from persisted settings', () => {
    const storage = {
      getItem: vi.fn((key: string) =>
        key === `${COMPONENT_SETTINGS_STORAGE_PREFIX}block-1`
          ? JSON.stringify({ autoplay: true })
          : null
      ),
    };
    expect(readComponentBlockAutoplay('block-1', storage)).toBe(true);
  });

  it('returns false for corrupt JSON', () => {
    const storage = { getItem: vi.fn(() => 'not-json') };
    expect(readComponentBlockAutoplay('block-1', storage)).toBe(false);
  });
});

describe('advanceCarouselPage', () => {
  it('wraps from last page to zero', () => {
    expect(advanceCarouselPage(2, 3)).toBe(0);
  });

  it('increments when not on last page', () => {
    expect(advanceCarouselPage(0, 3)).toBe(1);
  });

  it('treats non-positive totalPages as single page', () => {
    expect(advanceCarouselPage(0, 0)).toBe(0);
  });
});
