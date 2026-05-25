/** Canonical values — see many_faces_main/docs/guides/fe-global-preloader-tokens.md */

export const GLOBAL_PRELOADER_LOGO_SIZE_PX = 408;
export const GLOBAL_PRELOADER_LOGO_GAP_PX = 108;
export const GLOBAL_PRELOADER_DOT_FONT_PX = 60;
export const GLOBAL_PRELOADER_DOT_COLOR = '#475569';
export const GLOBAL_PRELOADER_BG = '#f8fafc';
/** Fixed row height so CSS dots never shift the stack vertically. */
export const GLOBAL_PRELOADER_SPINNER_SLOT_PX = 144;
export const GLOBAL_PRELOADER_VANILLA_DOT_PX = 36;
export const GLOBAL_PRELOADER_VANILLA_DOT_GAP_PX = 24;

export const GLOBAL_PRELOADER_TITLE_FONT_PX = 56;
export const GLOBAL_PRELOADER_TITLE_GAP_PX = 12;
export const GLOBAL_PRELOADER_SPINNER_GAP_PX = 36;

/** Bootstrap preloader on viewports at or below this width (portal + admin). */
export const GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX = 767;
/** 25% smaller than desktop bootstrap tokens. */
export const GLOBAL_PRELOADER_MOBILE_SCALE = 0.75;

function preloaderMobilePx(desktopPx: number): number {
	return Math.round(desktopPx * GLOBAL_PRELOADER_MOBILE_SCALE);
}

export const GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_LOGO_SIZE_PX
);
export const GLOBAL_PRELOADER_MOBILE_LOGO_GAP_PX = preloaderMobilePx(GLOBAL_PRELOADER_LOGO_GAP_PX);
export const GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_SPINNER_SLOT_PX
);
export const GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_VANILLA_DOT_PX
);
export const GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_VANILLA_DOT_GAP_PX
);
export const GLOBAL_PRELOADER_MOBILE_TITLE_FONT_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_TITLE_FONT_PX
);
export const GLOBAL_PRELOADER_MOBILE_TITLE_GAP_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_TITLE_GAP_PX
);
export const GLOBAL_PRELOADER_MOBILE_SPINNER_GAP_PX = preloaderMobilePx(
	GLOBAL_PRELOADER_SPINNER_GAP_PX
);

export const ROUTE_FALLBACK_LOGO_SIZE_PX = 64;
export const ROUTE_FALLBACK_DOT_FONT_PX = 16;
export const ROUTE_FALLBACK_SPINNER_SLOT_PX = 32;
