import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { profileAvatarUrl } from '../../components/grid/gridDisplayHelpers';
import { JOIN_MODE_I18N_KEY, liveControlsForMode } from './videoLoungeDetailLogic';
import type { LivePanelProps } from './types';

/**
 * In-call UI: participant tiles, speaking indicator (stub), mode-specific controls, Leave.
 */
export function LivePanel({
	joinMode,
	participants,
	stubRoom,
	isStub,
	micEnabled,
	camEnabled,
	onMicToggle,
	onCamToggle,
	onLeave,
	leaveBusy,
}: LivePanelProps) {
	const { t } = useTranslation('common');
	const controls = liveControlsForMode(joinMode);
	const speaking = stubRoom?.isSpeaking ?? false;

	return (
		<section className="vl-live" data-testid="video-lounge-live">
			{isStub ? (
				<p className="vl-live-stub-notice">
					{t(
						'pages.videoLounge.live.stubNotice',
						'Demo mode: LiveKit is stubbed — no real audio/video is sent.'
					)}
				</p>
			) : null}

			<p className="vl-live-mode">
				{t('pages.videoLounge.live.joinedAs', 'Joined as {{mode}}', {
					mode: t(JOIN_MODE_I18N_KEY[joinMode], joinMode),
				})}
			</p>

			<ul className="vl-live-tiles">
				{participants.map((p) => (
					<li
						key={p.userId}
						className={`vl-live-tile ${p.audioEnabled ? 'vl-live-tile--speaking' : ''}`}
					>
						<img
							className="vl-live-tile-avatar"
							src={profileAvatarUrl(p.userId, p.avatarUrl)}
							alt=""
						/>
						<span className="vl-live-tile-name">{p.displayName}</span>
						{p.audioEnabled ? <Volume2 size={14} className="vl-live-tile-speaking" /> : null}
					</li>
				))}
			</ul>

			{speaking ? (
				<p className="vl-live-speaking">{t('pages.videoLounge.live.speaking', 'Speaking…')}</p>
			) : null}

			<div className="vl-live-controls" data-testid="video-lounge-live-controls">
				{controls.showMic && (
					<button type="button" className="vl-live-control" onClick={onMicToggle}>
						{micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
						<span>{t('pages.videoLounge.live.micToggle', 'Microphone')}</span>
					</button>
				)}
				{controls.showCamera && (
					<button type="button" className="vl-live-control" onClick={onCamToggle}>
						{camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
						<span>{t('pages.videoLounge.live.camToggle', 'Camera')}</span>
					</button>
				)}
				<button
					type="button"
					className="vl-live-leave"
					disabled={leaveBusy}
					onClick={onLeave}
					data-testid="video-lounge-leave"
				>
					{leaveBusy ? '…' : t('pages.videoLounge.live.leave', 'Leave')}
				</button>
			</div>
		</section>
	);
}
