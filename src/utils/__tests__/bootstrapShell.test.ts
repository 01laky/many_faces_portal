import { describe, it, expect } from 'vitest';
import { buildVanillaPreloaderHtml } from '../globalPreloaderVanillaShell';

describe('bootstrapShell GPL', () => {
  it('GPL-15: vanilla HTML contains logo and dot markup', () => {
    const html = buildVanillaPreloaderHtml();
    expect(html).toContain('main-logo');
    expect(html).toContain('logo-raster-source.png');
    expect(html).toContain('global-app-preloader-vanilla__dot');
    expect(html).toContain('width:306px');
    expect(html).toContain('max-width:767px');
  });
});
