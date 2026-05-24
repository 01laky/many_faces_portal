import { ThreeDot } from 'react-loading-indicators';
import { MainLogo } from '../MainLogo/MainLogo';
import {
  GLOBAL_PRELOADER_DOT_COLOR,
  GLOBAL_PRELOADER_DOT_FONT_PX,
  ROUTE_FALLBACK_DOT_FONT_PX,
} from './preloaderTokens';
import './globalAppPreloader.scss';

export interface GlobalAppPreloaderProps {
  accessibilityLabel?: string;
  /** Smaller variant for lazy route Suspense fallback (Phase C). */
  variant?: 'bootstrap' | 'route-fallback';
}

/** Full-viewport bootstrap shell — logo + ThreeDot; fixed stack prevents layout jump. */
export function GlobalAppPreloader({
  accessibilityLabel = 'Loading application',
  variant = 'bootstrap',
}: GlobalAppPreloaderProps = {}) {
  const isRouteFallback = variant === 'route-fallback';
  const dotSize = isRouteFallback ? ROUTE_FALLBACK_DOT_FONT_PX : GLOBAL_PRELOADER_DOT_FONT_PX;
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
        <div className="global-app-preloader__spinner" aria-hidden="true">
          <div className="global-app-preloader__spinner-inner">
            <ThreeDot
              style={{ fontSize: `${dotSize}px`, lineHeight: 1, display: 'block' }}
              color={GLOBAL_PRELOADER_DOT_COLOR}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
