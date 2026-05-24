import { GlobalAppPreloader } from '../components/GlobalAppPreloader';

export function RouteLoadingFallback() {
  return <GlobalAppPreloader variant="route-fallback" accessibilityLabel="Loading page" />;
}
