/** Pre-React HTML/CSS shell — keep in sync with GlobalAppPreloader visual tokens. */

export const VANILLA_PRELOADER_FAVICON = '/favicon-32x32.png';

const VANILLA_STYLE = `
.global-app-preloader-vanilla{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;margin:0}
.global-app-preloader-vanilla__logo{width:68px;height:68px;display:block}
.global-app-preloader-vanilla__dots{display:flex;gap:4px;margin-top:18px}
.global-app-preloader-vanilla__dot{width:6px;height:6px;border-radius:50%;background:#475569;animation:global-preloader-bounce .9s infinite ease-in-out both}
.global-app-preloader-vanilla__dot:nth-child(2){animation-delay:.15s}
.global-app-preloader-vanilla__dot:nth-child(3){animation-delay:.3s}
@keyframes global-preloader-bounce{0%,80%,100%{transform:scale(.6);opacity:.5}40%{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.global-app-preloader-vanilla__dots{display:none}}
`.trim();

export function buildVanillaPreloaderHtml(): string {
  return (
    `<style>${VANILLA_STYLE}</style>` +
    '<div class="global-app-preloader-vanilla" role="status" aria-busy="true" aria-label="Loading application">' +
    `<img class="global-app-preloader-vanilla__logo" src="${VANILLA_PRELOADER_FAVICON}" width="68" height="68" alt="">` +
    '<div class="global-app-preloader-vanilla__dots" aria-hidden="true">' +
    '<span class="global-app-preloader-vanilla__dot"></span>'.repeat(3) +
    '</div></div>'
  );
}
