import { UserCard } from '../UserCard';
import type { UserListItem } from '../../api/services/UsersListService';
import './UserList.scss';

export function UserList({ users }: { users: UserListItem[] }) {
	return (
		<ul className="user-list">
			{users.map((user) => (
				<li key={user.id}>
					<UserCard user={user} />
				</li>
			))}
		</ul>
	);
}
