import { UserCard } from '../UserCard';
import type { UserListItem } from '../../api/services/UsersListService';
import './UserGrid.scss';

export function UserGrid({ users }: { users: UserListItem[] }) {
	return (
		<div className="user-grid">
			{users.map((user) => (
				<UserCard key={user.id} user={user} />
			))}
		</div>
	);
}
