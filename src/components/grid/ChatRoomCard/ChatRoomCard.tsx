import { useTranslation } from 'react-i18next';
import { profileAvatarUrl } from '../gridDisplayHelpers';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import './ChatRoomCard.scss';
import type { ChatRoomCardProps } from './types';

function formatActivity(iso: string | null): string {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
	} catch {
		return '';
	}
}

export function ChatRoomCard({ room, onOpen, interactive = true }: ChatRoomCardProps) {
	const { t } = useTranslation('common');
	const avatar = profileAvatarUrl(`chat-room-${room.id}`, null);
	const activity = formatActivity(room.lastMessageAt);
	const badges = [
		room.isSystemManaged ? t(k.chatRoomCard.badgeSystem, 'System') : null,
		room.isPublic
			? t(k.chatRoomCard.badgePublic, 'Public')
			: t(k.chatRoomCard.badgePrivate, 'Private'),
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<div
			className={`chatroom-card ${interactive ? 'chatroom-card--interactive' : ''}`}
			onClick={interactive ? onOpen : undefined}
			role={interactive ? 'button' : undefined}
			tabIndex={interactive ? 0 : undefined}
			onKeyDown={
				interactive
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onOpen?.();
							}
						}
					: undefined
			}
		>
			<img className="chatroom-card-avatar" src={avatar} alt="" loading="lazy" />
			<div className="chatroom-card-info">
				<span className="chatroom-card-name">{room.title}</span>
				<span className="chatroom-card-meta">
					{t(k.chatRoomCard.members, '{{count}} members', {
						count: room.memberCount,
						defaultValue: '{{count}} members',
					})}
					{badges ? ` · ${badges}` : ''}
				</span>
				{activity ? (
					<span className="chatroom-card-activity">
						{t(k.chatRoomCard.lastActivity, 'Last activity {{activity}}', { activity })}
					</span>
				) : null}
			</div>
		</div>
	);
}
