import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { UserCircle } from 'lucide-react';
import '../UserDetailPage/UserDetailPage.scss';

/**
 * Profile page - shows current user's own profile (FE only, from auth state).
 */
export function ProfilePage() {
	const { t } = useTranslation('common');
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated || !user) {
		return null; // ProtectedRoute handles redirect
	}

	const displayName =
		[user.firstName, user.lastName].filter(Boolean).join(' ') ||
		user.email?.split('@')[0] ||
		'User';

	return (
		<div className="user-detail-page">
			<div className="user-detail-card">
				<div className="user-detail-avatar">
					<UserCircle size={80} />
				</div>
				<h1 className="user-detail-name">{displayName}</h1>
				<dl className="user-detail-fields">
					<div className="user-detail-field">
						<dt>{t('pages.userDetail.id')}</dt>
						<dd>{user.id}</dd>
					</div>
					{user.email && (
						<div className="user-detail-field">
							<dt>{t('pages.userDetail.email')}</dt>
							<dd>{user.email}</dd>
						</div>
					)}
					{user.firstName && (
						<div className="user-detail-field">
							<dt>{t('pages.userDetail.firstName')}</dt>
							<dd>{user.firstName}</dd>
						</div>
					)}
					{user.lastName && (
						<div className="user-detail-field">
							<dt>{t('pages.userDetail.lastName')}</dt>
							<dd>{user.lastName}</dd>
						</div>
					)}
				</dl>
			</div>
		</div>
	);
}
