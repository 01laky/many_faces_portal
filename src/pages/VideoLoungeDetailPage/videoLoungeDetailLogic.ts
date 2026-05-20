import type { VideoLoungeJoinMode } from '../../api/services/VideoLoungesService';

/** Portal UI labels for API join modes (Watcher = Viewer). */
export const VIDEO_LOUNGE_JOIN_MODES: VideoLoungeJoinMode[] = ['Viewer', 'Listener', 'Full'];

export type VideoLoungeDetailPhase = 'lobby' | 'live';

/** i18n keys under pages.videoLounge.modes.* */
export const JOIN_MODE_I18N_KEY: Record<VideoLoungeJoinMode, string> = {
  Viewer: 'pages.videoLounge.modes.viewer',
  Listener: 'pages.videoLounge.modes.listener',
  Full: 'pages.videoLounge.modes.full',
};

/**
 * Device preview is shown only for publish-capable modes (Listener/Full), not Watcher.
 */
export function shouldShowDevicePreview(joinMode: VideoLoungeJoinMode | null): boolean {
  return joinMode === 'Listener' || joinMode === 'Full';
}

/**
 * Connect stays disabled until the member picks a join mode and (when required) passes preview.
 */
export function isConnectEnabled(params: {
  joinMode: VideoLoungeJoinMode | null;
  previewReady: boolean;
  connectBusy: boolean;
  canConnect: boolean;
  isHostViewer: boolean;
}): boolean {
  if (params.connectBusy || !params.canConnect || params.isHostViewer) return false;
  if (!params.joinMode) return false;
  if (shouldShowDevicePreview(params.joinMode) && !params.previewReady) return false;
  return true;
}

/** Live badge for grid cards: "Live · N" when a session is active. */
export function formatVideoLoungeLiveBadge(count: number): string {
  return `Live · ${Math.max(0, count)}`;
}

/** Milliseconds until token refresh should run (refresh one minute before expiry). */
export function msUntilTokenRefresh(expiresAtUtc: string, nowMs: number = Date.now()): number {
  const exp = Date.parse(expiresAtUtc);
  if (!Number.isFinite(exp)) return 0;
  const refreshAt = exp - 60_000;
  return Math.max(0, refreshAt - nowMs);
}

/** Which in-call controls are available per join mode (v1: no mid-call upgrade). */
export function liveControlsForMode(joinMode: VideoLoungeJoinMode): {
  showMic: boolean;
  showCamera: boolean;
} {
  if (joinMode === 'Viewer') return { showMic: false, showCamera: false };
  if (joinMode === 'Listener') return { showMic: true, showCamera: false };
  return { showMic: true, showCamera: true };
}

/** Maps HTTP status from live/join to lobby copy keys. */
export function joinLiveErrorI18nKey(status: number): string | null {
  if (status === 409) return 'pages.videoLounge.lobby.roomFull';
  if (status === 403) return 'pages.videoLounge.lobby.cannotConnect';
  return null;
}
