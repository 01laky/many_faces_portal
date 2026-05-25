import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import type {
	FaceVideoLoungeDto,
	VideoLoungeJoinMode,
	VideoLoungeLiveParticipantDto,
	VideoLoungeLiveSnapshotDto,
} from '../../api/services/VideoLoungesService';
import { profileAvatarUrl } from '../../components/grid/gridDisplayHelpers';
import {
	JOIN_MODE_I18N_KEY,
	VIDEO_LOUNGE_JOIN_MODES,
	isConnectEnabled,
	shouldShowDevicePreview,
} from './videoLoungeDetailLogic';

export interface LobbyPanelProps {
	lounge: FaceVideoLoungeDto;
	live: VideoLoungeLiveSnapshotDto | null;
	joinMode: VideoLoungeJoinMode | null;
	onJoinModeChange: (mode: VideoLoungeJoinMode) => void;
	previewStream: MediaStream | null;
	previewError: string | null;
	previewReady: boolean;
	onStartPreview: () => void;
	connectBusy: boolean;
	startBusy: boolean;
	connectError: string | null;
	onStartSession: () => void;
	onConnect: () => void;
}

function RosterRow({ p }: { p: VideoLoungeLiveParticipantDto }) {
	const avatar = profileAvatarUrl(p.userId, p.avatarUrl);
	return (
		<li className="vl-lobby-roster-item">
			<img className="vl-lobby-roster-avatar" src={avatar} alt="" loading="lazy" />
			<span className="vl-lobby-roster-name">{p.displayName}</span>
			<span className="vl-lobby-roster-mode">{p.joinMode}</span>
			<span className="vl-lobby-roster-icons" aria-hidden>
				{p.audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
				{p.videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
			</span>
		</li>
	);
}

/**
 * Pre-connect lobby: roster, join mode radios, optional device preview, Start session / Connect.
 * Host viewers see read-only state (no Start/Connect).
 */
export function LobbyPanel({
	lounge,
	live,
	joinMode,
	onJoinModeChange,
	previewStream,
	previewError,
	previewReady,
	onStartPreview,
	connectBusy,
	startBusy,
	connectError,
	onStartSession,
	onConnect,
}: LobbyPanelProps) {
	const { t } = useTranslation('common');
	const snapshot = live ?? {
		hasLiveSession: lounge.hasLiveSession,
		liveParticipantCount: lounge.liveParticipantCount,
		liveViewerCount: 0,
		liveSpeakerCount: 0,
		liveParticipants: [],
	};
	const canAct = lounge.canConnect && !lounge.isHostViewer;
	const connectEnabled = isConnectEnabled({
		joinMode,
		previewReady: !shouldShowDevicePreview(joinMode) || previewReady,
		connectBusy,
		canConnect: lounge.canConnect,
		isHostViewer: lounge.isHostViewer,
	});

	return (
		<section className="vl-lobby" data-testid="video-lounge-lobby">
			<div className="vl-lobby-presence">
				<Users size={18} aria-hidden />
				<span>
					{t('pages.videoLounge.lobby.liveCount', '{{count}} in live session', {
						count: snapshot.liveParticipantCount,
					})}
				</span>
				{snapshot.hasLiveSession ? (
					<span className="vl-lobby-presence-sub">
						{t(
							'pages.videoLounge.lobby.modeCounts',
							'{{viewers}} watching · {{speakers}} speaking',
							{
								viewers: snapshot.liveViewerCount,
								speakers: snapshot.liveSpeakerCount,
							}
						)}
					</span>
				) : (
					<span className="vl-lobby-presence-sub">
						{t('pages.videoLounge.lobby.noSession', 'No live session yet')}
					</span>
				)}
			</div>

			{snapshot.liveParticipants.length > 0 ? (
				<div className="vl-lobby-roster">
					<h2 className="vl-lobby-roster-title">
						{t('pages.videoLounge.lobby.rosterTitle', 'Live now')}
					</h2>
					<ul className="vl-lobby-roster-list">
						{snapshot.liveParticipants.map((p) => (
							<RosterRow key={p.userId} p={p} />
						))}
					</ul>
				</div>
			) : null}

			{canAct && (
				<>
					{!snapshot.hasLiveSession && (
						<button
							type="button"
							className="vl-lobby-primary"
							disabled={startBusy}
							onClick={onStartSession}
						>
							{startBusy ? '…' : t('pages.videoLounge.lobby.startSession', 'Start session')}
						</button>
					)}

					<fieldset className="vl-lobby-modes">
						<legend>{t('pages.videoLounge.lobby.selectMode', 'Choose how to join')}</legend>
						{VIDEO_LOUNGE_JOIN_MODES.map((mode) => (
							<label key={mode} className="vl-lobby-mode">
								<input
									type="radio"
									name="vl-join-mode"
									value={mode}
									checked={joinMode === mode}
									onChange={() => onJoinModeChange(mode)}
								/>
								{t(JOIN_MODE_I18N_KEY[mode], mode)}
							</label>
						))}
					</fieldset>

					{shouldShowDevicePreview(joinMode) && (
						<div className="vl-lobby-preview" data-testid="video-lounge-preview">
							<p>{t('pages.videoLounge.preview.title', 'Test your devices before connecting')}</p>
							{previewError ? (
								<p className="vl-lobby-preview-error" role="alert">
									{t(
										'pages.videoLounge.preview.denied',
										'Microphone or camera permission was denied. Allow access to connect.'
									)}
								</p>
							) : (
								<>
									<video
										className="vl-lobby-preview-video"
										ref={(el) => {
											if (el && previewStream) {
												el.srcObject = previewStream;
												void el.play().catch(() => {});
											}
										}}
										muted
										playsInline
										autoPlay
									/>
									<button type="button" className="vl-lobby-secondary" onClick={onStartPreview}>
										{previewReady
											? t('pages.videoLounge.preview.retest', 'Test again')
											: joinMode === 'Full'
												? t('pages.videoLounge.preview.testCam', 'Test microphone & camera')
												: t('pages.videoLounge.preview.testMic', 'Test microphone')}
									</button>
								</>
							)}
						</div>
					)}

					<button
						type="button"
						className="vl-lobby-primary"
						disabled={!connectEnabled || !snapshot.hasLiveSession}
						onClick={onConnect}
						data-testid="video-lounge-connect"
					>
						{connectBusy ? '…' : t('pages.videoLounge.lobby.connect', 'Connect')}
					</button>
					{!snapshot.hasLiveSession && joinMode ? (
						<p className="vl-lobby-hint">
							{t(
								'pages.videoLounge.lobby.noLiveSession',
								'Start a session first, or wait for someone else to go live.'
							)}
						</p>
					) : null}
					{connectError ? (
						<p className="vl-lobby-error" role="alert">
							{connectError}
						</p>
					) : null}
				</>
			)}

			{lounge.isHostViewer && (
				<p className="vl-lobby-host-note">
					{t(
						'pages.videoLounge.lobby.hostView',
						'Host view — you can watch the lobby but cannot connect.'
					)}
				</p>
			)}
		</section>
	);
}
