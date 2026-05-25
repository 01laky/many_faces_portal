import type {
	FaceVideoLoungeDto,
	VideoLoungeJoinMode,
	VideoLoungeLiveParticipantDto,
	VideoLoungeLiveSnapshotDto,
} from '../../api/services/VideoLoungesService';
import type { StubLiveKitRoom } from './videoLoungeLiveKitStub';

export interface LivePanelProps {
	joinMode: VideoLoungeJoinMode;
	participants: VideoLoungeLiveParticipantDto[];
	stubRoom: StubLiveKitRoom | null;
	isStub: boolean;
	micEnabled: boolean;
	camEnabled: boolean;
	onMicToggle: () => void;
	onCamToggle: () => void;
	onLeave: () => void;
	leaveBusy: boolean;
}

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
