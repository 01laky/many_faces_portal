/** Pre-React HTML/CSS shell — keep in sync with GlobalAppPreloader/preloaderTokens.ts */

import { buildMainLogoMarkup } from '../components/MainLogo/mainLogoMarkup';
import { buildPreloaderBrandTitleHtml } from '../components/GlobalAppPreloader/appBrandDisplayName';
import {
	GLOBAL_PRELOADER_BG,
	GLOBAL_PRELOADER_SPINNER_GAP_PX,
	GLOBAL_PRELOADER_SPINNER_SLOT_PX,
	GLOBAL_PRELOADER_LOGO_SIZE_PX,
	GLOBAL_PRELOADER_TITLE_FONT_PX,
	GLOBAL_PRELOADER_TITLE_GAP_PX,
	GLOBAL_PRELOADER_VANILLA_DOT_GAP_PX,
	GLOBAL_PRELOADER_VANILLA_DOT_PX,
} from '../components/GlobalAppPreloader/preloaderTokens';
import {
	buildBrandFontFaceCss,
	buildVanillaMobileMediaCss,
} from '../components/GlobalAppPreloader/preloaderResponsiveCss';

function buildVanillaStyle(): string {
	return (
		buildBrandFontFaceCss() +
		`
.global-app-preloader-vanilla{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;min-height:100dvh;background:${GLOBAL_PRELOADER_BG};margin:0;padding:0;overflow:hidden;box-sizing:border-box}
.global-app-preloader-vanilla__stack{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.global-app-preloader-vanilla__logo{width:${GLOBAL_PRELOADER_LOGO_SIZE_PX}px;height:${GLOBAL_PRELOADER_LOGO_SIZE_PX}px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.global-app-preloader-vanilla__logo .main-logo{width:${GLOBAL_PRELOADER_LOGO_SIZE_PX}px;height:${GLOBAL_PRELOADER_LOGO_SIZE_PX}px;flex-shrink:0}
.global-app-preloader-vanilla__logo .main-logo img{width:100%;height:100%;display:block;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15))}
.global-app-preloader-vanilla__title{margin:${GLOBAL_PRELOADER_TITLE_GAP_PX}px 0 0;padding:0;font-size:${GLOBAL_PRELOADER_TITLE_FONT_PX}px;line-height:1.05;color:#1e293b;text-align:center;flex-shrink:0;white-space:nowrap;letter-spacing:.02em}
.global-app-preloader-vanilla__dots{display:flex;align-items:center;justify-content:center;gap:${GLOBAL_PRELOADER_VANILLA_DOT_GAP_PX}px;margin-top:${GLOBAL_PRELOADER_SPINNER_GAP_PX}px;min-height:${GLOBAL_PRELOADER_SPINNER_SLOT_PX}px;height:${GLOBAL_PRELOADER_SPINNER_SLOT_PX}px;flex-shrink:0}
.global-app-preloader-vanilla__dot{width:${GLOBAL_PRELOADER_VANILLA_DOT_PX}px;height:${GLOBAL_PRELOADER_VANILLA_DOT_PX}px;border-radius:50%;background:#475569;flex-shrink:0;transform-origin:center center;animation:global-preloader-bounce .9s infinite ease-in-out both}
.global-app-preloader-vanilla__dot:nth-child(2){animation-delay:.15s}
.global-app-preloader-vanilla__dot:nth-child(3){animation-delay:.3s}
@keyframes global-preloader-bounce{0%,80%,100%{transform:scale(.75);opacity:.55}40%{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.global-app-preloader-vanilla__dots{visibility:hidden}}
${buildVanillaMobileMediaCss()}`.trim()
	);
}

export function buildVanillaPreloaderHtml(): string {
	return (
		`<style>${buildVanillaStyle()}</style>` +
		'<div class="global-app-preloader-vanilla" role="status" aria-busy="true" aria-label="Loading application">' +
		'<div class="global-app-preloader-vanilla__stack">' +
		`<div class="global-app-preloader-vanilla__logo">${buildMainLogoMarkup()}</div>` +
		buildPreloaderBrandTitleHtml() +
		'<div class="global-app-preloader-vanilla__dots" aria-hidden="true">' +
		'<span class="global-app-preloader-vanilla__dot"></span>'.repeat(3) +
		'</div></div></div>'
	);
}

export function buildVanillaPreloaderHeadStyle(): string {
	return buildVanillaStyle();
}
