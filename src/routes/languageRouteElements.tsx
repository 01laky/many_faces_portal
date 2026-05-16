import type { ReactElement } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { GuestRoute } from '../components/GuestRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePageProtected } from '../pages/HomePageProtected';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RegisterCompletePage } from '../pages/RegisterCompletePage';
import {
  ProfilePage,
  UsersPage,
  UserDetailPage,
  ComponentListPage,
  ComponentDetailPage,
  AlbumDetailPage,
  BlogDetailPage,
  ReelDetailPage,
  FaceProfilesListPage,
  FaceProfileDetailPage,
  StoriesListPage,
  MySubmissionsPage,
} from './lazyPages';
import { GuestRedirectToFaceHome, GuestRedirectToFacePath } from './GuestRedirects';
import { SyncFaceFromProfileRoutes } from './SyncFaceFromProfileRoutes';
import type { FaceRouteEntry, LanguageNestedRoutesProps } from './types';
import { FacePageView } from '../components/FacePageView';
import { HomePage } from '../pages/HomePage';

export function renderGuestLanguageIndexRoute(): ReactElement {
  return (
    <Route
      index
      element={
        <GuestRoute>
          <GuestRedirectToFaceHome />
        </GuestRoute>
      }
    />
  );
}

function facePagePublicElement(fr: FaceRouteEntry): ReactElement | null {
  const pathNorm = fr.page.path.replace(/^\//, '');
  const isPublicLogin = fr.isPublic && pathNorm === 'login';
  const isPublicRegister = fr.isPublic && pathNorm === 'register';
  const isPublicHome = fr.isPublic && pathNorm === 'home' && fr.page.pageType?.index === 'home';
  if (isPublicLogin) {
    return (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    );
  }
  if (isPublicRegister) {
    return (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    );
  }
  if (isPublicHome) {
    return (
      <GuestRoute>
        <HomePage />
      </GuestRoute>
    );
  }
  return null;
}

/** Each item must be a literal `<Route>` — wrappers break React Router v6 child validation. */
export function renderFaceDynamicRouteElements(
  faceRoutes: FaceRouteEntry[],
  wallRefreshKey: number
): ReactElement[] {
  return faceRoutes.map((fr) => {
    const publicEl = facePagePublicElement(fr);
    return fr.isPublic ? (
      <Route
        key={fr.key}
        path={fr.path}
        element={publicEl ?? <FacePageView page={fr.page} wallRefreshKey={wallRefreshKey} />}
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
  });
}

/** Guest routes for login/register; `register/complete` matches mail links `/{locale}/register/complete?hash=`. */
export function renderTranslatedAndFeatureRouteElements({
  loginPaths,
  registerPaths,
  homepagePaths,
  profilePaths,
  usersPaths,
  token,
}: LanguageNestedRoutesProps): ReactElement[] {
  return [
    ...loginPaths.map((path) => (
      <Route
        key={`login-${path}`}
        path={path}
        element={
          <GuestRoute>
            <GuestRedirectToFacePath subPath={path} fallback={<LoginPage />} />
          </GuestRoute>
        }
      />
    )),
    ...registerPaths.map((path) => (
      <Route
        key={`reg-${path}`}
        path={path}
        element={
          <GuestRoute>
            <GuestRedirectToFacePath subPath={path} fallback={<RegisterPage />} />
          </GuestRoute>
        }
      />
    )),
    <Route
      key="register-complete"
      path="register/complete"
      element={
        <GuestRoute>
          <RegisterCompletePage />
        </GuestRoute>
      }
    />,
    ...homepagePaths.map((path) => (
      <Route
        key={`home-${path}`}
        path={path}
        element={
          <ProtectedRoute>
            <HomePageProtected />
          </ProtectedRoute>
        }
      />
    )),
    ...profilePaths.map((path) => (
      <Route
        key={`prof-${path}`}
        path={path}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    )),
    <Route
      key="list"
      path="list/:componentTypeId"
      element={
        <ProtectedRoute>
          <ComponentListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="detail"
      path="detail/:componentTypeId/:entityId"
      element={
        <ProtectedRoute>
          <ComponentDetailPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="album"
      path="album/:id"
      element={
        <ProtectedRoute>
          <AlbumDetailPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="blog"
      path="blog/:id"
      element={
        <ProtectedRoute>
          <BlogDetailPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="reel"
      path="reel/:id"
      element={
        <ProtectedRoute>
          <ReelDetailPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="my-submissions"
      path="my-submissions"
      element={
        <ProtectedRoute>
          <MySubmissionsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="profiles"
      path=":faceIndex/profiles"
      element={
        <ProtectedRoute>
          <SyncFaceFromProfileRoutes>
            <FaceProfilesListPage />
          </SyncFaceFromProfileRoutes>
        </ProtectedRoute>
      }
    />,
    <Route
      key="profile-user"
      path=":faceIndex/profile/:userId"
      element={
        <ProtectedRoute>
          <SyncFaceFromProfileRoutes>
            <FaceProfileDetailPage />
          </SyncFaceFromProfileRoutes>
        </ProtectedRoute>
      }
    />,
    <Route
      key="stories"
      path=":faceIndex/stories"
      element={
        <ProtectedRoute>
          <SyncFaceFromProfileRoutes>
            <StoriesListPage />
          </SyncFaceFromProfileRoutes>
        </ProtectedRoute>
      }
    />,
    ...usersPaths.map((path) => (
      <Route
        key={`users-detail-${path}`}
        path={`${path}/:id`}
        element={<ProtectedRoute>{token && <UserDetailPage token={token} />}</ProtectedRoute>}
      />
    )),
    ...usersPaths.map((path) => (
      <Route
        key={`users-list-${path}`}
        path={path}
        element={<ProtectedRoute>{token && <UsersPage token={token} />}</ProtectedRoute>}
      />
    )),
    <Route key="lang-catch" path="*" element={<Navigate to=".." replace />} />,
  ];
}
