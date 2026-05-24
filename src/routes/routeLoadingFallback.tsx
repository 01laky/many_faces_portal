import { GlobalAppPreloader } from '../components/GlobalAppPreloader';

/** Keep bootstrap sizing so the logo does not shrink after AppBootstrapGate opens. */
export function RouteLoadingFallback() {
  return <GlobalAppPreloader accessibilityLabel="Loading page" />;
}
