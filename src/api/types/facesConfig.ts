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
	gradientSettings?: string | null;
	isPublic: boolean;
	/** Profile directory visibility (API enum name) */
	visibility?: string | null;
	allowRecensions?: boolean;
	/** When true, non-host members may create chat rooms from the app */
	chatRoomsCreate?: boolean;
	/** When true, non-host members may create video lounges from the app */
	videoLoungesCreate?: boolean;
	/** Current user's face role (only when authenticated) */
	myFaceRoleId?: number | null;
	myFaceRoleName?: string | null;
	/** Server: first switch into this face */
	myVisited?: boolean | null;
	/** Server: face role onboarding confirmed */
	myFaceRoleIntroCompleted?: boolean | null;
	pages: PageConfig[];
}

export interface FaceRoleOption {
	id: number;
	name: string;
}

export type FacesConfigResponse = FaceConfig[];
