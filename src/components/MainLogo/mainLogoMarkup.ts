import { MAIN_LOGO_RASTER_URL } from './logoRaster';

/** Inline logo block — same DOM as React `MainLogo` for pixel-perfect preloader handoff. */
export function buildMainLogoMarkup(sizePx?: number): string {
	const sizeAttr = sizePx != null ? ` width="${sizePx}" height="${sizePx}"` : '';
	return `<div class="main-logo"><img src="${MAIN_LOGO_RASTER_URL}"${sizeAttr} alt=""></div>`;
}
