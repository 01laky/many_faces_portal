/**
 * FacePageView - Renders a face page with its grid layout
 *
 * Displays page name and the responsive grid layout defined in admin.
 * The grid is read-only (non-draggable, non-resizable).
 */

import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { PageGridLayout } from './PageGridLayout';
import type { PageConfig } from '../api/types/facesConfig';
import './FacePageView.scss';

interface FacePageViewProps {
  page: PageConfig;
}

export function FacePageView({ page }: FacePageViewProps) {
  const { user } = useAuth();
  const { t } = useTranslation('common');

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

            {page.gridSchema ? (
              <PageGridLayout gridSchemaJson={page.gridSchema} />
            ) : (
              <div className="face-page-empty">
                <p className="text-muted">{page.description || t('pages.homepage.description')}</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
