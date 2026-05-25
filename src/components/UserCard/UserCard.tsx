import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import type { UserListItem } from '../../api/services/UsersListService';
import './UserCard.scss';

function formatUserName(u: UserListItem) {
	const first = u.firstName?.trim() || '';
	const last = u.lastName?.trim() || '';
	const name = [first, last].filter(Boolean).join(' ');
	return name || u.email || u.id;
}

export function UserCard({ user }: { user: UserListItem }) {
	const getLocalizedPath = useLocalizedLink();
	const name = formatUserName(user);

	return (
		<Link to={getLocalizedPath(`/users/${user.id}`)} className="user-card">
			<div className="user-card-avatar">
				<UserCircle size={40} />
			</div>
			<div className="user-card-info">
				<span className="user-card-name">{name}</span>
				{user.email && <span className="user-card-email">{user.email}</span>}
			</div>
		</Link>
	);
}
