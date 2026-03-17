/**
 * FacesConfig types - Type definitions for faces configuration endpoint
 * 
 * Types for GET /api/faces/config endpoint response
 */

export interface RouteTranslationConfig {
  languageCode: string;
  translatedRoute: string;
}

export interface PageTypeConfig {
  index: string;
  id: number;
}

export interface PageConfig {
  index: number;
  id: number;
  name: string;
  description?: string | null;
  path: string;
  gridSchema?: string | null;
  pageType: PageTypeConfig;
  routeTranslations: RouteTranslationConfig[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface FaceConfig {
  index: string;
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  gradientSettings?: string | null;
  isPublic: boolean;
  /** Current user's face role (only when authenticated) */
  myFaceRoleId?: number | null;
  myFaceRoleName?: string | null;
  pages: PageConfig[];
}

export interface FaceRoleOption {
  id: number;
  name: string;
}

export type FacesConfigResponse = FaceConfig[];
