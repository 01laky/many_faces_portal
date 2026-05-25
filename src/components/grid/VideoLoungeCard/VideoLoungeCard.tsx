import { useTranslation } from 'react-i18next';
import { profileAvatarUrl } from '../gridDisplayHelpers';
import { formatVideoLoungeLiveBadge } from '../../../pages/VideoLoungeDetailPage/videoLoungeDetailLogic';
import './VideoLoungeCard.scss';
import type { VideoLoungeCardProps } from './types';

export function VideoLoungeCard({ lounge, onOpen, interactive = true }: VideoLoungeCardProps) {
	const { t } = useTranslation('common');
	const avatar = profileAvatarUrl(`video-lounge-${lounge.id}`, null);
	const badges = [lounge.isSystemManaged ? 'System' : null, lounge.isPublic ? 'Public' : 'Private']
		.filter(Boolean)
		.join(' · ');

	return (
		<div
			className={`videolounge-card ${interactive ? 'videolounge-card--interactive' : ''}`}
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
			<img className="videolounge-card-avatar" src={avatar} alt="" loading="lazy" />
			<div className="videolounge-card-info">
				<span className="videolounge-card-name">{lounge.title}</span>
				<span className="videolounge-card-meta">
					{lounge.memberCount} members{badges ? ` · ${badges}` : ''}
				</span>
				{lounge.hasLiveSession ? (
					<span className="videolounge-card-live" data-testid="video-lounge-live-badge">
						{t('grid.videoLounge.liveBadge', 'Live · {{count}}', {
							count: lounge.liveParticipantCount,
							defaultValue: formatVideoLoungeLiveBadge(lounge.liveParticipantCount),
						})}
					</span>
				) : null}
			</div>
		</div>
	);
}
