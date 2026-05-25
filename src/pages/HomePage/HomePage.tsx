import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import './HomePage.scss';

export function HomePage() {
	const { user } = useAuth();
	const { t } = useTranslation('common');
	const getLocalizedPath = useLocalizedLink();

	const showAllToasts = () => {
		// Success toast
		toast.success('This is a success message!', {
			position: 'top-center',
		});

		// Error toast
		toast.error('This is an error message!', {
			position: 'top-center',
		});

		// Warning toast
		toast.warning('This is a warning message!', {
			position: 'top-center',
		});

		// Info toast
		toast.info('This is an info message!', {
			position: 'top-center',
		});
	};

	return (
		<div className="home-page-wrapper">
			<Container fluid className="h-100 p-0">
				<Row className="h-100 g-0">
					<Col
						xs={12}
						className="app-content d-flex flex-column align-items-center justify-content-center"
					>
						<h1 className="text-center m-0 mb-4">hello fe</h1>

						{user && (
							<div className="mb-3 text-center">
								<p className="mb-1">Welcome, {user.email}</p>
								{user.firstName && user.lastName && (
									<p className="mb-0 text-muted">
										{user.firstName} {user.lastName}
									</p>
								)}
							</div>
						)}

						<div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
							<button
								onClick={showAllToasts}
								style={{
									padding: '0.5rem 1.5rem',
									fontSize: '1rem',
									backgroundColor: '#0d6efd',
									color: 'white',
									border: 'none',
									borderRadius: '0.375rem',
									cursor: 'pointer',
									transition: 'background-color 0.2s',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = '#0b5ed7';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = '#0d6efd';
								}}
							>
								Show All Toast Types
							</button>
						</div>

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
