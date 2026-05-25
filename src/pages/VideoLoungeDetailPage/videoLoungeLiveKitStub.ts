import type { VideoLoungeJoinMode } from '../../api/services/VideoLoungesService';

export interface StubLiveKitConnectParams {
	serverUrl: string;
	roomName: string;
	token: string;
	joinMode: VideoLoungeJoinMode;
	displayName: string;
}

export interface StubLiveKitRoom {
	disconnect: () => void;
	setMicrophoneEnabled: (enabled: boolean) => void;
	setCameraEnabled: (enabled: boolean) => void;
	isSpeaking: boolean;
}

/**
 * Development stub when the API returns isStub=true (no real LiveKit SDK in portal v1).
 * Simulates a connected room so LivePanel can render tiles and toggles without WebRTC.
 */
export function connectStubLiveKitRoom(params: StubLiveKitConnectParams): StubLiveKitRoom {
	void params;
	let micOn = params.joinMode !== 'Viewer';
	let camOn = params.joinMode === 'Full';

	return {
		get isSpeaking() {
			return micOn && params.joinMode !== 'Viewer';
		},
		disconnect() {
			micOn = false;
			camOn = false;
		},
		setMicrophoneEnabled(enabled: boolean) {
			if (params.joinMode === 'Viewer') return;
			micOn = enabled;
		},
		setCameraEnabled(enabled: boolean) {
			if (params.joinMode !== 'Full') return;
			camOn = enabled;
			void camOn;
		},
	};
}
