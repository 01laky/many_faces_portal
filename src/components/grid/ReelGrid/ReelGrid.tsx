/**
 * ReelGrid - Paginated grid of reels for the current face (API-backed).
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
  type SyntheticEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getReels, type ReelItem } from '../../../api/services/ReelsService';
import { CreatorModerationBadge } from '../CreatorModerationBadge';
import {
  useStablePaginationEmit,
  useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../../hooks/useFillGridPagination';
import './ReelGrid.scss';

export interface ReelGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function ReelGrid({ page: controlledPage, onPageChange }: ReelGridProps = {}) {
  const { t } = useTranslation('common');
  const itemsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [items, setItems] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const observeGrid = Boolean(token) && faceId != null && !loading && !loadError;
  const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
    gap: 10,
    minColWidth: 125,
    imageHeightFromCellWidth: 16 / 9,
    infoBlockPx: 0,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!token || faceId == null) {
        if (!cancelled) {
          setLoading(false);
          setItems([]);
        }
        return;
      }
      if (!cancelled) {
        setLoading(true);
        setLoadError(false);
      }
      try {
        const data = await getReels(token, faceId);
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleReels = useMemo(
    () => items.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, items, itemsPerPage]
  );

  const emitPage = useStablePaginationEmit(onPageChange);
  useSyncedPaginationReport(emitPage, clampedPage, totalPages);

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const next =
        typeof value === 'function'
          ? value(isControlled ? (controlledPage ?? 0) : internalPage)
          : value;
      if (isControlled) emitPage(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
      else setInternalPage(next);
    },
    [isControlled, controlledPage, internalPage, totalPages, emitPage]
  );

  const playPreview = useCallback((e: SyntheticEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  const stopPreview = useCallback((e: SyntheticEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  const itemsStyle = { '--grid-cols': gridCols, '--reel-grid-gap': '10px' } as CSSProperties;

  const showInternalPagination = !isControlled;

  if (!token || faceId == null) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <p>{t(k.guest.reels)}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <Loader2 size={28} className="reel-grid-spinner" aria-label={t(k.loadingAria)} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <p>{t(k.loadError.reels)}</p>
      </div>
    );
  }

  return (
    <div className="reel-grid-component">
      <div className="reel-grid-items" ref={itemsRef} style={itemsStyle}>
        {visibleReels.map((reel) => (
          <div
            key={reel.id}
            className="reel-grid-card"
            onClick={() => navigate(getLocalizedPath(`/reel/${reel.id}`))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(getLocalizedPath(`/reel/${reel.id}`));
            }}
            onMouseEnter={playPreview}
            onMouseLeave={stopPreview}
            onFocus={playPreview}
            onBlur={stopPreview}
          >
            <video
              className="reel-grid-card-video"
              muted
              playsInline
              loop
              preload="metadata"
              src={reel.videoUrl}
            />
            <div className="reel-grid-card-overlay">
              <span className="reel-grid-card-title">{reel.title}</span>
              <CreatorModerationBadge
                approvalStatus={reel.approvalStatus}
                aiReviewStatus={reel.aiReviewStatus}
                aiReviewUserMessage={reel.aiReviewUserMessage}
                humanDecisionReason={reel.humanDecisionReason}
              />
              <span className="reel-grid-card-likes">♥ {reel.likesCount}</span>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="reel-grid-empty">{t(k.empty.reelsCreate)}</p>}
      {showInternalPagination && totalPages > 1 && (
        <div className="reel-grid-pagination">
          <button type="button" disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>
            {clampedPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={clampedPage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
