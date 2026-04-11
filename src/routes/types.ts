import type { PageConfig } from '../api/types/facesConfig';

/** One concrete URL segment under `/:lang` built from face config + page. */
export type FaceRouteEntry = {
  key: string;
  path: string;
  isPublic: boolean;
  page: PageConfig;
};

/** Props passed from `AppRoutes` into `buildLanguageNestedRoutes`. */
export type LanguageNestedRoutesProps = {
  faceRoutes: FaceRouteEntry[];
  wallRefreshKey: number;
  loginPaths: string[];
  registerPaths: string[];
  homepagePaths: string[];
  profilePaths: string[];
  usersPaths: string[];
  token: string | null;
};
