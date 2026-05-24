import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import {
  VideoLoungeApiError,
  getVideoLounge,
  getVideoLoungeLive,
  heartbeatVideoLoungeLive,
  joinPublicVideoLounge,
  joinVideoLoungeLive,
  leaveVideoLoungeLive,
  refreshVideoLoungeLiveToken,
  requestJoinVideoLounge,
  startVideoLoungeLive,
  type FaceVideoLoungeDto,
  type VideoLoungeJoinMode,
  type VideoLoungeLiveJoinResultDto,
} from '../../api/services/VideoLoungesService';
import { LobbyPanel } from './LobbyPanel';
import { LivePanel } from './LivePanel';
import { useDevicePreview } from './useDevicePreview';
import {
  joinLiveErrorI18nKey,
  msUntilTokenRefresh,
  shouldShowDevicePreview,
  type VideoLoungeDetailPhase,
} from './videoLoungeDetailLogic';
import { connectStubLiveKitRoom, type StubLiveKitRoom } from './videoLoungeLiveKitStub';
import './VideoLoungeDetailPage.scss';

const LIVE_ROSTER_POLL_MS = 12_000;
const HEARTBEAT_INTERVAL_MS = 30_000;

export function VideoLoungeDetailPage({ loungeId: loungeIdProp }: { loungeId: number }) {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const { t } = useTranslation('common');
  const [lounge, setLounge] = useState<FaceVideoLoungeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState<VideoLoungeDetailPhase>('lobby');
  const [joinMode, setJoinMode] = useState<VideoLoungeJoinMode | null>(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [connectBusy, setConnectBusy] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [liveJoin, setLiveJoin] = useState<VideoLoungeLiveJoinResultDto | null>(null);
  const [stubRoom, setStubRoom] = useState<StubLiveKitRoom | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const faceId = selectedFace?.id;
  const tokenRef = useRef(token);
  const liveJoinRef = useRef(liveJoin);
  const joinModeRef = useRef(joinMode);
  const phaseRef = useRef(phase);
  const { previewStream, previewError, previewReady, startPreview, stopPreview } =
    useDevicePreview();

  const handleJoinModeChange = useCallback(
    (mode: VideoLoungeJoinMode) => {
      setJoinMode(mode);
      if (!shouldShowDevicePreview(mode)) {
        stopPreview();
      }
    },
    [stopPreview]
  );

  useEffect(() => {
    tokenRef.current = token;
    liveJoinRef.current = liveJoin;
    joinModeRef.current = joinMode;
    phaseRef.current = phase;
  }, [token, liveJoin, joinMode, phase]);

  const loadLounge = useCallback(async () => {
    if (!faceId || !token) return;
    try {
      const r = await getVideoLounge(faceId, loungeIdProp, token);
      setLounge(r);
      setLoadError(false);
    } catch {
      setLoadError(true);
      setLounge(null);
    } finally {
      setLoading(false);
    }
  }, [faceId, token, loungeIdProp]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadLounge();
    })();
  }, [loadLounge]);

  const liveQuery = useQuery({
    queryKey: ['videoLoungeLive', faceId, loungeIdProp, phase],
    queryFn: () => getVideoLoungeLive(faceId!, loungeIdProp, token!),
    enabled: Boolean(faceId && token && lounge),
    refetchInterval: phase === 'lobby' || phase === 'live' ? LIVE_ROSTER_POLL_MS : false,
  });

  /** Returns to lobby, tears down stub SFU, and clears connect errors. */
  const returnToLobby = useCallback(async () => {
    stubRoom?.disconnect();
    setStubRoom(null);
    setLiveJoin(null);
    setPhase('lobby');
    setSessionExpired(false);
    setConnectError(null);
    stopPreview();
    await loadLounge();
    void liveQuery.refetch();
  }, [stubRoom, stopPreview, loadLounge, liveQuery]);

  /**
   * Best-effort leave for tab close; uses refs so beforeunload does not need React state.
   */
  const leaveLiveBestEffort = useCallback(() => {
    const tkn = tokenRef.current;
    const fid = faceId;
    if (!tkn || !fid || phaseRef.current !== 'live') return;
    void leaveVideoLoungeLive(fid, loungeIdProp, tkn).catch(() => {});
  }, [faceId, loungeIdProp]);

  useEffect(() => {
    const onLeave = () => leaveLiveBestEffort();
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('auth:unauthorized', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('auth:unauthorized', onLeave);
    };
  }, [leaveLiveBestEffort]);

  useEffect(() => {
    if (phase !== 'live' || !faceId || !token) return;
    const id = window.setInterval(() => {
      void heartbeatVideoLoungeLive(faceId, loungeIdProp, token).catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase, faceId, token, loungeIdProp]);

  useEffect(() => {
    if (phase !== 'live' || !liveJoin || !joinMode || !faceId || !token) return;
    const schedule = () => {
      const delay = msUntilTokenRefresh(liveJoin.expiresAtUtc);
      return window.setTimeout(async () => {
        try {
          const refreshed = await refreshVideoLoungeLiveToken(
            faceId,
            loungeIdProp,
            token,
            joinMode
          );
          setLiveJoin((prev) =>
            prev
              ? {
                  ...prev,
                  token: refreshed.token,
                  serverUrl: refreshed.serverUrl,
                  roomName: refreshed.roomName,
                  isStub: refreshed.isStub,
                  expiresAtUtc: refreshed.expiresAtUtc,
                }
              : prev
          );
        } catch {
          setSessionExpired(true);
          toast.error(
            t('pages.videoLounge.live.sessionExpired', 'Session expired — return to the lobby.')
          );
          await returnToLobby();
        }
      }, delay);
    };
    const timer = schedule();
    return () => clearTimeout(timer);
  }, [phase, liveJoin, joinMode, faceId, token, loungeIdProp, t, returnToLobby]);

  const handleConnect = async () => {
    if (!faceId || !token || !joinMode || !lounge) return;
    setConnectBusy(true);
    setConnectError(null);
    try {
      const result = await joinVideoLoungeLive(faceId, loungeIdProp, token, joinMode);
      setLiveJoin(result);
      setMicEnabled(joinMode !== 'Viewer');
      setCamEnabled(joinMode === 'Full');
      if (result.isStub) {
        setStubRoom(
          connectStubLiveKitRoom({
            serverUrl: result.serverUrl,
            roomName: result.roomName,
            token: result.token,
            joinMode,
            displayName: 'You',
          })
        );
      } else {
        setStubRoom(null);
        toast.info(t('pages.videoLounge.live.realKitPending', 'LiveKit client not bundled in v1.'));
      }
      stopPreview();
      setPhase('live');
      void liveQuery.refetch();
    } catch (err) {
      if (err instanceof VideoLoungeApiError) {
        const key = joinLiveErrorI18nKey(err.status);
        setConnectError(key ? t(key) : err.message);
      } else {
        setConnectError(
          err instanceof Error
            ? err.message
            : t('pages.videoLounge.lobby.connectFailed', 'Could not connect')
        );
      }
    } finally {
      setConnectBusy(false);
    }
  };

  const handleStartSession = async () => {
    if (!faceId || !token) return;
    setStartBusy(true);
    try {
      await startVideoLoungeLive(faceId, loungeIdProp, token);
      await loadLounge();
      void liveQuery.refetch();
      toast.success(t('pages.videoLounge.lobby.sessionStarted', 'Live session started.'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start session');
    } finally {
      setStartBusy(false);
    }
  };

  const handleLeaveLive = async () => {
    if (!faceId || !token) return;
    setLeaveBusy(true);
    try {
      await leaveVideoLoungeLive(faceId, loungeIdProp, token);
    } catch {
      // still return to lobby locally
    } finally {
      setLeaveBusy(false);
      setJoinMode(null);
      await returnToLobby();
    }
  };

  const handleJoinPublic = async () => {
    if (!faceId || !token) return;
    setJoinBusy(true);
    try {
      await joinPublicVideoLounge(faceId, loungeIdProp, token);
      await loadLounge();
      toast.success(t('pages.videoLounge.join.joined', 'You joined the lounge.'));
    } catch {
      toast.error(t('pages.videoLounge.join.failed', 'Could not join'));
    } finally {
      setJoinBusy(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!faceId || !token) return;
    setJoinBusy(true);
    try {
      await requestJoinVideoLounge(faceId, loungeIdProp, token);
      await loadLounge();
      toast.success(t('pages.videoLounge.join.requestSent', 'Join request sent.'));
    } catch {
      toast.error(t('pages.videoLounge.join.requestFailed', 'Could not send request'));
    } finally {
      setJoinBusy(false);
    }
  };

  if (!selectedFace) {
    return (
      <div className="vl-detail vl-detail--centered">
        <p>{t('pages.videoLounge.noFace', 'Select a face first.')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vl-detail vl-detail--centered">
        <Loader2 className="vl-detail-spinner" size={32} />
      </div>
    );
  }

  if (loadError || !lounge) {
    return (
      <div className="vl-detail vl-detail--centered">
        <p>{t('pages.videoLounge.notFound', 'Video lounge not found.')}</p>
      </div>
    );
  }

  const showMembershipActions = !lounge.isMember && !lounge.isHostViewer;
  const canParticipate = lounge.isMember || lounge.isHostViewer;

  return (
    <div className="vl-detail" data-phase={phase} data-testid="video-lounge-detail">
      {lounge.description ? <p className="vl-detail-desc">{lounge.description}</p> : null}
      <p className="vl-detail-meta">
        {lounge.memberCount} {t('pages.videoLounge.lobby.members', 'members')}
        {lounge.isHostViewer ? ` · ${t('pages.videoLounge.lobby.hostViewShort', 'Host view')}` : ''}
      </p>

      {showMembershipActions && (
        <div className="vl-detail-actions">
          {lounge.isPublic ? (
            <button
              type="button"
              className="vl-detail-primary"
              disabled={joinBusy}
              onClick={handleJoinPublic}
            >
              {joinBusy ? '…' : t('pages.videoLounge.join.join', 'Join lounge')}
            </button>
          ) : (
            <button
              type="button"
              className="vl-detail-primary"
              disabled={joinBusy || lounge.hasPendingRequest}
              onClick={handleRequestJoin}
            >
              {lounge.hasPendingRequest
                ? t('pages.videoLounge.join.pending', 'Request pending')
                : t('pages.videoLounge.join.requestJoin', 'Request to join')}
            </button>
          )}
        </div>
      )}

      {sessionExpired ? (
        <p className="vl-detail-expired" role="alert">
          {t('pages.videoLounge.live.sessionExpired', 'Session expired — return to the lobby.')}
        </p>
      ) : null}

      {canParticipate && phase === 'lobby' && (
        <LobbyPanel
          lounge={lounge}
          live={liveQuery.data ?? null}
          joinMode={joinMode}
          onJoinModeChange={handleJoinModeChange}
          previewStream={previewStream}
          previewError={previewError}
          previewReady={previewReady}
          onStartPreview={() => void startPreview(joinMode)}
          connectBusy={connectBusy}
          startBusy={startBusy}
          connectError={connectError}
          onStartSession={handleStartSession}
          onConnect={handleConnect}
        />
      )}

      {phase === 'live' && joinMode && liveJoin && (
        <LivePanel
          joinMode={joinMode}
          participants={liveQuery.data?.liveParticipants ?? []}
          stubRoom={stubRoom}
          isStub={liveJoin.isStub}
          micEnabled={micEnabled}
          camEnabled={camEnabled}
          onMicToggle={() => {
            const next = !micEnabled;
            setMicEnabled(next);
            stubRoom?.setMicrophoneEnabled(next);
          }}
          onCamToggle={() => {
            const next = !camEnabled;
            setCamEnabled(next);
            stubRoom?.setCameraEnabled(next);
          }}
          onLeave={handleLeaveLive}
          leaveBusy={leaveBusy}
        />
      )}
    </div>
  );
}
