/**
 * FacePageView - Renders a face page with its grid layout
 *
 * Displays page name and the responsive grid layout defined in admin.
 * The grid is read-only (non-draggable, non-resizable).
 * Wall page type shows the face wall ticket list and optional grid below.
 */

import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { PageGridLayout } from './PageGridLayout';
import { WallTicketsSection } from './WallTicketsSection';
import type { PageConfig } from '../api/types/facesConfig';
import './FacePageView.scss';

interface FacePageViewProps {
  page: PageConfig;
  /** Bumps when a new ticket is created so the wall list refetches */
  wallRefreshKey?: number;
}

export function FacePageView({ page, wallRefreshKey = 0 }: FacePageViewProps) {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const isWall = page.pageType?.index === 'wall';

  return (
    <div className="face-page-view">
      <Container fluid className="h-100 p-0">
        <Row className="g-0">
          <Col xs={12} className="face-page-content">
            <div className="face-page-header">
              <h1 className="text-center m-0 mb-2">{page.name}</h1>
              {user && (
                <p className="text-muted text-center mb-0">
                  {t('pages.homepage.welcome')}, {user.firstName || user.email}
                </p>
              )}
            </div>

            {isWall && <WallTicketsSection refreshKey={wallRefreshKey} />}

            {page.gridSchema ? (
              <PageGridLayout gridSchemaJson={page.gridSchema} />
            ) : !isWall ? (
              <div className="face-page-empty">
                <p className="text-muted">{page.description || t('pages.homepage.description')}</p>
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
