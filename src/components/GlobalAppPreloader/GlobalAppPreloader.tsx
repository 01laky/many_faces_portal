import { useEffect, useState } from 'react';
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

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Full-viewport bootstrap shell — logo + ThreeDot; no route hooks. */
export function GlobalAppPreloader({
  accessibilityLabel = 'Loading application',
  variant = 'bootstrap',
}: GlobalAppPreloaderProps = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const isRouteFallback = variant === 'route-fallback';
  const dotSize = isRouteFallback ? ROUTE_FALLBACK_DOT_FONT_PX : GLOBAL_PRELOADER_DOT_FONT_PX;

  return (
    <div
      className={`global-app-preloader${isRouteFallback ? ' global-app-preloader--route-fallback' : ''}`}
      role="status"
      aria-busy="true"
      aria-label={accessibilityLabel}
      data-testid="global-app-preloader"
    >
      <div className="global-app-preloader__logo">
        <MainLogo />
      </div>
      {!reducedMotion && (
        <div className="global-app-preloader__spinner" aria-hidden="true">
          <ThreeDot style={{ fontSize: `${dotSize}px` }} color={GLOBAL_PRELOADER_DOT_COLOR} />
        </div>
      )}
    </div>
  );
}
