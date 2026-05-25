import {
	GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX,
	GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX,
	GLOBAL_PRELOADER_MOBILE_SPINNER_GAP_PX,
	GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX,
	GLOBAL_PRELOADER_MOBILE_TITLE_FONT_PX,
	GLOBAL_PRELOADER_MOBILE_TITLE_GAP_PX,
	GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX,
	GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX,
} from './preloaderTokens';

/** @font-face + `.app-brand-font` for vanilla shell / index.html critical CSS. */
export function buildBrandFontFaceCss(): string {
	return `@font-face{font-family:'Sweetest Cat Ever';src:url('/fonts/sweetest-cat-ever.ttf') format('truetype');font-weight:400;font-style:normal;font-display:swap}.app-brand-font{font-family:'Sweetest Cat Ever','Segoe Script','Brush Script MT',cursive;font-weight:400;font-style:normal}`;
}

/** Mobile-only vanilla shell overrides — keep in sync with index.html critical CSS. */
export function buildVanillaMobileMediaCss(): string {
	const logo = GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX;
	const titleGap = GLOBAL_PRELOADER_MOBILE_TITLE_GAP_PX;
	const titleFont = GLOBAL_PRELOADER_MOBILE_TITLE_FONT_PX;
	const spinnerGap = GLOBAL_PRELOADER_MOBILE_SPINNER_GAP_PX;
	const slot = GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX;
	const dot = GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX;
	const dotGap = GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX;

	return `@media (max-width:${GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX}px){.global-app-preloader-vanilla__logo{width:${logo}px;height:${logo}px}.global-app-preloader-vanilla__logo .main-logo{width:${logo}px;height:${logo}px}.global-app-preloader-vanilla__title{margin-top:${titleGap}px;font-size:${titleFont}px}.global-app-preloader-vanilla__dots{gap:${dotGap}px;margin-top:${spinnerGap}px;min-height:${slot}px;height:${slot}px}.global-app-preloader-vanilla__dot{width:${dot}px;height:${dot}px}}`;
}
