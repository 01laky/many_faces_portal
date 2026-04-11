import { Route } from 'react-router-dom';
import { LanguageRouter } from '../components/LanguageRouter';
import type { LanguageNestedRoutesProps } from './types';
import {
  renderGuestLanguageIndexRoute,
  renderFaceDynamicRouteElements,
  renderTranslatedAndFeatureRouteElements,
} from './languageRouteElements';

/** Single `/:lang` branch for `<Routes>` — use as `{buildLanguageNestedRoutes(props)}`. */
export function buildLanguageNestedRoutes(props: LanguageNestedRoutesProps) {
  const { faceRoutes, wallRefreshKey } = props;
  return (
    <Route path="/:lang" element={<LanguageRouter />}>
      {renderGuestLanguageIndexRoute()}
      {renderFaceDynamicRouteElements(faceRoutes, wallRefreshKey)}
      {renderTranslatedAndFeatureRouteElements(props)}
    </Route>
  );
}
