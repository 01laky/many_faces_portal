/**
 * FacePageView - Renders a face page with its grid layout
 *
 * Displays the responsive grid layout defined in admin.
 * The grid is read-only (non-draggable, non-resizable).
 * Wall page type shows the face wall ticket list and optional grid below.
 */

import { useTranslation } from 'react-i18next';
import { PageGridLayout } from '../PageGridLayout';
import { WallTicketsSection } from '../WallTicketsSection';
import './FacePageView.scss';
import type { FacePageViewProps } from './types';

export function FacePageView({ page, wallRefreshKey = 0 }: FacePageViewProps) {
	const { t } = useTranslation('common');
	const isWall = page.pageType?.index === 'wall';

	return (
		<div className="face-page-view">
			<div className="face-page-content">
				{isWall && <WallTicketsSection refreshKey={wallRefreshKey} />}

				{page.gridSchema ? (
					<PageGridLayout gridSchemaJson={page.gridSchema} />
				) : !isWall ? (
					<div className="face-page-empty">
						<p className="text-muted">{page.description || t('pages.homepage.description')}</p>
					</div>
				) : null}
			</div>
		</div>
	);
}
