/** Display name shown under the bootstrap preloader mask. */
export const APP_BRAND_DISPLAY_NAME = 'Many Faces';

/** Inline title for vanilla pre-React shell — matches React `PreloaderBrandTitle`. */
export function buildPreloaderBrandTitleHtml(): string {
	return `<p class="global-app-preloader-vanilla__title app-brand-font">${APP_BRAND_DISPLAY_NAME}</p>`;
}
