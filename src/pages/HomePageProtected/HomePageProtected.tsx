import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import '../HomePage/HomePage.scss';

export function HomePageProtected() {
  const { user } = useAuth();
  const { t } = useTranslation('common');

  return (
    <div className="home-page-wrapper">
      <Container fluid className="h-100 p-0">
        <Row className="h-100 g-0">
          <Col
            xs={12}
            className="app-content d-flex flex-column align-items-center justify-content-center"
          >
            <h1 className="text-center m-0 mb-4">{t('pages.homepage.title')}</h1>

            {user && (
              <div className="mb-3 text-center">
                <p className="mb-1">
                  {t('pages.homepage.welcome')}, {user.email}
                </p>
                {user.firstName && user.lastName && (
                  <p className="mb-0 text-muted">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            )}

            <div className="text-center">
              <p className="text-muted">{t('pages.homepage.description')}</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
