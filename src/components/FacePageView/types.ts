import type { PageConfig } from '../../api/types/facesConfig';

export interface FacePageViewProps {
	page: PageConfig;
	/** Bumps when a new ticket is created so the wall list refetches */
	wallRefreshKey?: number;
}
