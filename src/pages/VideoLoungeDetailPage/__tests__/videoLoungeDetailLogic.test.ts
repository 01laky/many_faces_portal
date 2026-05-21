import { describe, it, expect } from 'vitest';
import {
  formatVideoLoungeLiveBadge,
  isConnectEnabled,
  joinLiveErrorI18nKey,
  liveControlsForMode,
  msUntilTokenRefresh,
  shouldShowDevicePreview,
} from '../videoLoungeDetailLogic';
import { connectStubLiveKitRoom } from '../videoLoungeLiveKitStub';

describe('videoLoungeDetailLogic', () => {
  it('VL-FE-01: isConnectEnabled requires join mode', () => {
    expect(
      isConnectEnabled({
        joinMode: null,
        previewReady: true,
        connectBusy: false,
        canConnect: true,
        isHostViewer: false,
      })
    ).toBe(false);
  });

  it('VL-FE-02: isConnectEnabled true when Viewer selected', () => {
    expect(
      isConnectEnabled({
        joinMode: 'Viewer',
        previewReady: false,
        connectBusy: false,
        canConnect: true,
        isHostViewer: false,
      })
    ).toBe(true);
  });

  it('VL-FE-15: Listener requires preview ready', () => {
    expect(
      isConnectEnabled({
        joinMode: 'Listener',
        previewReady: false,
        connectBusy: false,
        canConnect: true,
        isHostViewer: false,
      })
    ).toBe(false);
    expect(
      isConnectEnabled({
        joinMode: 'Listener',
        previewReady: true,
        connectBusy: false,
        canConnect: true,
        isHostViewer: false,
      })
    ).toBe(true);
  });

  it('VL-FE-16: Watcher skips device preview', () => {
    expect(shouldShowDevicePreview('Viewer')).toBe(false);
    expect(shouldShowDevicePreview('Listener')).toBe(true);
    expect(shouldShowDevicePreview('Full')).toBe(true);
  });

  it('VL-FE-05: host cannot connect', () => {
    expect(
      isConnectEnabled({
        joinMode: 'Full',
        previewReady: true,
        connectBusy: false,
        canConnect: true,
        isHostViewer: true,
      })
    ).toBe(false);
  });

  it('VL-FE-17: formatVideoLoungeLiveBadge', () => {
    expect(formatVideoLoungeLiveBadge(3)).toBe('Live · 3');
  });

  it('VL-FE-21: joinLiveErrorI18nKey maps 409', () => {
    expect(joinLiveErrorI18nKey(409)).toBe('pages.videoLounge.lobby.roomFull');
  });

  it('joinLiveErrorI18nKey maps 403 and ignores other statuses', () => {
    expect(joinLiveErrorI18nKey(403)).toBe('pages.videoLounge.lobby.cannotConnect');
    expect(joinLiveErrorI18nKey(500)).toBeNull();
  });

  it('isConnectEnabled blocks busy, disconnected, and host viewers', () => {
    expect(
      isConnectEnabled({
        joinMode: 'Full',
        previewReady: true,
        connectBusy: true,
        canConnect: true,
        isHostViewer: false,
      })
    ).toBe(false);
    expect(
      isConnectEnabled({
        joinMode: 'Full',
        previewReady: true,
        connectBusy: false,
        canConnect: false,
        isHostViewer: false,
      })
    ).toBe(false);
  });

  it('formatVideoLoungeLiveBadge clamps negative counts', () => {
    expect(formatVideoLoungeLiveBadge(-1)).toBe('Live · 0');
  });

  it('msUntilTokenRefresh returns 0 for invalid expiry', () => {
    expect(msUntilTokenRefresh('not-a-date')).toBe(0);
    expect(msUntilTokenRefresh(new Date(Date.now() - 120_000).toISOString())).toBe(0);
  });

  it('VL-FE-20: Viewer hides mic/cam controls', () => {
    expect(liveControlsForMode('Viewer')).toEqual({ showMic: false, showCamera: false });
    expect(liveControlsForMode('Listener')).toEqual({ showMic: true, showCamera: false });
    expect(liveControlsForMode('Full')).toEqual({ showMic: true, showCamera: true });
  });

  it('VL-FE-19: msUntilTokenRefresh schedules before expiry', () => {
    const exp = new Date(Date.now() + 5 * 60_000).toISOString();
    const ms = msUntilTokenRefresh(exp, Date.now());
    expect(ms).toBeGreaterThan(3 * 60_000);
    expect(ms).toBeLessThanOrEqual(4 * 60_000);
  });
});

describe('videoLoungeLiveKitStub', () => {
  it('VL-FE-06: stub Viewer is subscribe-only', () => {
    const room = connectStubLiveKitRoom({
      serverUrl: 'wss://stub',
      roomName: 'r',
      token: 't',
      joinMode: 'Viewer',
      displayName: 'A',
    });
    room.setMicrophoneEnabled(true);
    expect(room.isSpeaking).toBe(false);
    room.disconnect();
  });

  it('VL-FE-07: stub Listener can toggle mic', () => {
    const room = connectStubLiveKitRoom({
      serverUrl: 'wss://stub',
      roomName: 'r',
      token: 't',
      joinMode: 'Listener',
      displayName: 'A',
    });
    expect(room.isSpeaking).toBe(true);
    room.setMicrophoneEnabled(false);
    expect(room.isSpeaking).toBe(false);
  });

  it('VL-FE-08: stub Full allows camera toggle', () => {
    const room = connectStubLiveKitRoom({
      serverUrl: 'wss://stub',
      roomName: 'r',
      token: 't',
      joinMode: 'Full',
      displayName: 'A',
    });
    room.setCameraEnabled(false);
    room.setCameraEnabled(true);
    expect(room.isSpeaking).toBe(true);
  });
});
