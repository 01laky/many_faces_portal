import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUsers, type UserListItem } from '../../api/services/UsersListService';
import { UserGrid } from '../../components/UserGrid';
import { UserList } from '../../components/UserList';
import './UsersPage.scss';

export function UsersPage({ token }: { token: string }) {
	const { t } = useTranslation('common');
	const [users, setUsers] = useState<UserListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	useEffect(() => {
		let cancelled = false;
		getUsers(token, { pageSize: 200 })
			.then((data) => {
				if (!cancelled) setUsers(data.items);
			})
			.catch(() => {
				if (!cancelled) {
					toast.error(t('pages.users.loadError'));
					setUsers([]);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [token, t]);

	if (loading) {
		return (
			<div className="users-page users-page--loading">
				<Loader2 size={32} className="spin" />
				<span>{t('pages.users.loading')}</span>
			</div>
		);
	}

	return (
		<div className="users-page">
			<div className="users-page-header">
				<div className="users-page-view-toggle">
					<button
						type="button"
						className={`users-view-btn ${viewMode === 'grid' ? 'users-view-btn--active' : ''}`}
						onClick={() => setViewMode('grid')}
						title={t('pages.users.gridView')}
					>
						<LayoutGrid size={18} />
					</button>
					<button
						type="button"
						className={`users-view-btn ${viewMode === 'list' ? 'users-view-btn--active' : ''}`}
						onClick={() => setViewMode('list')}
						title={t('pages.users.listView')}
					>
						<List size={18} />
					</button>
				</div>
			</div>
			{users.length === 0 ? (
				<p className="users-page-empty">{t('pages.users.noUsers')}</p>
			) : viewMode === 'grid' ? (
				<UserGrid users={users} />
			) : (
				<UserList users={users} />
			)}
		</div>
	);
}
