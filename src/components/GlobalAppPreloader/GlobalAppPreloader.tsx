import { ThreeDot } from 'react-loading-indicators';
import { MainLogo } from '../MainLogo/MainLogo';
import { GLOBAL_PRELOADER_DOT_COLOR, ROUTE_FALLBACK_DOT_FONT_PX } from './preloaderTokens';
import { PreloaderDots } from './PreloaderDots';
import { PreloaderBrandTitle } from './PreloaderBrandTitle';
import './globalAppPreloader.scss';

export interface GlobalAppPreloaderProps {
  accessibilityLabel?: string;
  /** Smaller variant for lazy route Suspense fallback (Phase C). */
  variant?: 'bootstrap' | 'route-fallback';
}

/** Full-viewport bootstrap shell — logo + CSS dots; fixed stack prevents layout jump. */
export function GlobalAppPreloader({
  accessibilityLabel = 'Loading application',
  variant = 'bootstrap',
}: GlobalAppPreloaderProps = {}) {
  const isRouteFallback = variant === 'route-fallback';
  const modeClass = isRouteFallback
    ? ' global-app-preloader--route-fallback'
    : ' global-app-preloader--bootstrap';

  return (
    <div
      className={`global-app-preloader${modeClass}`}
      role="status"
      aria-busy="true"
      aria-label={accessibilityLabel}
      data-testid="global-app-preloader"
    >
      <div className="global-app-preloader__stack">
        <div className="global-app-preloader__logo">
          <MainLogo />
        </div>
        {!isRouteFallback ? <PreloaderBrandTitle /> : null}
        <div className="global-app-preloader__spinner" aria-hidden="true">
          {isRouteFallback ? (
            <div className="global-app-preloader__spinner-inner">
              <ThreeDot
                style={{
                  fontSize: `${ROUTE_FALLBACK_DOT_FONT_PX}px`,
                  lineHeight: 1,
                  display: 'block',
                }}
                color={GLOBAL_PRELOADER_DOT_COLOR}
              />
            </div>
          ) : (
            <PreloaderDots />
          )}
        </div>
      </div>
    </div>
  );
}
