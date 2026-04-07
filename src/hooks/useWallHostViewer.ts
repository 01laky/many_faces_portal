import { useEffect, useState } from 'react';
import { fetchWallTickets } from '../api/services/wallTicketsApi';

export interface UseWallHostViewerOptions {
  enabled: boolean;
  token: string | null | undefined;
  faceId: number | undefined;
}

/**
 * Loads wall list meta to know if current user is face host (hide create on wall).
 * When disabled or missing token/face, isHost is null (unknown).
 */
export function useWallHostViewer({ enabled, token, faceId }: UseWallHostViewerOptions) {
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !token || faceId == null) {
      setIsHost(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchWallTickets(token, faceId, 1, 1);
        if (!cancelled) setIsHost(res.isHostViewer);
      } catch {
        if (!cancelled) setIsHost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, token, faceId]);

  const canShowWallCreate = enabled && !!token && faceId != null && isHost === false;

  return { isHost, loading, canShowWallCreate };
}
