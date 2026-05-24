import {
  GLOBAL_PRELOADER_MOBILE_LOGO_GAP_PX,
  GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX,
  GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX,
  GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX,
  GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX,
  GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX,
} from './preloaderTokens';

/** Mobile-only bootstrap overrides — keep in sync with globalAppPreloader.scss. */
export function buildBootstrapMobileMediaCss(rootSelector: string): string {
  return `@media (max-width:${GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX}px){${rootSelector}{--gpl-logo:${GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX}px;--gpl-gap:${GLOBAL_PRELOADER_MOBILE_LOGO_GAP_PX}px;--gpl-spinner-slot:${GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX}px;--gpl-dot:${GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX}px;--gpl-dot-gap:${GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX}px}}`;
}

/** Mobile-only vanilla shell overrides — keep in sync with index.html critical CSS. */
export function buildVanillaMobileMediaCss(): string {
  const logo = GLOBAL_PRELOADER_MOBILE_LOGO_SIZE_PX;
  const gap = GLOBAL_PRELOADER_MOBILE_LOGO_GAP_PX;
  const slot = GLOBAL_PRELOADER_MOBILE_SPINNER_SLOT_PX;
  const dot = GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_PX;
  const dotGap = GLOBAL_PRELOADER_MOBILE_VANILLA_DOT_GAP_PX;

  return `@media (max-width:${GLOBAL_PRELOADER_MOBILE_MAX_WIDTH_PX}px){.global-app-preloader-vanilla__logo{width:${logo}px;height:${logo}px}.global-app-preloader-vanilla__logo .main-logo{width:${logo}px;height:${logo}px}.global-app-preloader-vanilla__dots{gap:${dotGap}px;margin-top:${gap}px;min-height:${slot}px;height:${slot}px}.global-app-preloader-vanilla__dot{width:${dot}px;height:${dot}px}}`;
}
