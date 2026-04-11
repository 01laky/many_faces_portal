import type { ReactElement } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { GuestRoute } from '../components/GuestRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePageProtected } from '../pages/HomePageProtected';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
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
} from './lazyPages';
import { GuestRedirectToFaceHome, GuestRedirectToFacePath } from './GuestRedirects';
import { SyncFaceFromProfileRoutes } from './SyncFaceFromProfileRoutes';
import type { FaceRouteEntry, LanguageNestedRoutesProps } from './types';
import { FacePageRouteRow } from './FacePageRouteRow';

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

export function renderFaceDynamicRouteElements(
  faceRoutes: FaceRouteEntry[],
  wallRefreshKey: number
): ReactElement[] {
  return faceRoutes.map((fr) => (
    <FacePageRouteRow key={fr.key} fr={fr} wallRefreshKey={wallRefreshKey} />
  ));
}

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
