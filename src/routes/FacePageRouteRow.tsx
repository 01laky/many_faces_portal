import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { GuestRoute } from '../components/GuestRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { FacePageView } from '../components/FacePageView';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import type { FaceRouteEntry } from './types';

export function FacePageRouteRow({
  fr,
  wallRefreshKey,
}: {
  fr: FaceRouteEntry;
  wallRefreshKey: number;
}): ReactElement {
  const pathNorm = fr.page.path.replace(/^\//, '');
  const isPublicLogin = fr.isPublic && pathNorm === 'login';
  const isPublicRegister = fr.isPublic && pathNorm === 'register';
  const isPublicHome = fr.isPublic && pathNorm === 'home' && fr.page.pageType?.index === 'home';
  const publicElement = isPublicLogin ? (
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  ) : isPublicRegister ? (
    <GuestRoute>
      <RegisterPage />
    </GuestRoute>
  ) : isPublicHome ? (
    <GuestRoute>
      <HomePage />
    </GuestRoute>
  ) : null;

  return fr.isPublic ? (
    <Route
      key={fr.key}
      path={fr.path}
      element={publicElement ?? <FacePageView page={fr.page} wallRefreshKey={wallRefreshKey} />}
    />
  ) : (
    <Route
      key={fr.key}
      path={fr.path}
      element={
        <ProtectedRoute>
          <FacePageView page={fr.page} wallRefreshKey={wallRefreshKey} />
        </ProtectedRoute>
      }
    />
  );
}
