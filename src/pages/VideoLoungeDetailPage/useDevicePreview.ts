import { useCallback, useEffect, useRef, useState } from 'react';
import type { VideoLoungeJoinMode } from '../../api/services/VideoLoungesService';
import { shouldShowDevicePreview } from './videoLoungeDetailLogic';

/**
 * Lobby device preview via getUserMedia — no SFU connection.
 * Caller should invoke stopPreview when join mode changes away from Listener/Full.
 */
export function useDevicePreview() {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setPreviewStream(null);
    setPreviewReady(false);
  }, []);

  const startPreview = useCallback(
    async (joinMode: VideoLoungeJoinMode | null) => {
      if (!joinMode || !shouldShowDevicePreview(joinMode)) return;
      setPreviewError(null);
      stopPreview();
      try {
        const audio = joinMode === 'Listener' || joinMode === 'Full';
        const video = joinMode === 'Full';
        const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
        streamRef.current = stream;
        setPreviewStream(stream);
        setPreviewReady(true);
      } catch {
        setPreviewError('denied');
        setPreviewReady(false);
      }
    },
    [stopPreview]
  );

  useEffect(() => () => stopPreview(), [stopPreview]);

  return {
    previewStream,
    previewError,
    previewReady,
    startPreview,
    stopPreview,
  };
}
