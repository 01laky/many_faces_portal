import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import './HomePage.scss';

export function HomePage() {
	const { user } = useAuth();
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();

	return (
		<div className="home-page-wrapper">
			<Container fluid className="h-100 p-0">
				<Row className="h-100 g-0">
					<Col
						xs={12}
						className="app-content d-flex flex-column align-items-center justify-content-center"
					>
						<h1 className="text-center m-0 mb-4">
							{t('pages.home.guestTitle', 'Welcome to Many Faces')}
						</h1>

						{user && (
							<div className="mb-3 text-center">
								<p className="mb-1">
									{t('pages.home.welcome', 'Welcome')}, {user.email}
								</p>
								{user.firstName && user.lastName && (
									<p className="mb-0 text-muted">
										{user.firstName} {user.lastName}
									</p>
								)}
							</div>
						)}

						<div className="home-links mt-3">
							<Link to={getLocalizedPath('/login')} className="home-link">
								{t('pages.login.title')}
							</Link>
							<span className="home-link-separator">|</span>
							<Link to={getLocalizedPath('/register')} className="home-link">
								{t('pages.register.title')}
							</Link>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
