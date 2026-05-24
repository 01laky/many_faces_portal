import { describe, it, expect } from 'vitest';
import { buildVanillaPreloaderHtml } from '../globalPreloaderVanillaShell';

describe('bootstrapShell GPL', () => {
  it('GPL-15: vanilla HTML contains logo and dot markup', () => {
    const html = buildVanillaPreloaderHtml();
    expect(html).toContain('favicon-32x32.png');
    expect(html).toContain('global-app-preloader-vanilla__dot');
    expect(html).toContain('width="68"');
  });
});
