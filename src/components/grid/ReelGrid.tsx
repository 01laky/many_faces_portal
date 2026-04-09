/**
 * ReelGrid - Paginated grid of reels for the current face (API-backed).
 */

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getReels, type ReelItem } from '../../api/services/ReelsService';
import {
  useStablePaginationEmit,
  useSyncedPaginationReport,
} from '../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../hooks/useFillGridPagination';
import './ReelGrid.scss';

export interface ReelGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function ReelGrid({ page: controlledPage, onPageChange }: ReelGridProps = {}) {
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

  const observeGrid = Boolean(token) && !loading && !loadError;
  const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
    gap: 4,
    minColWidth: 100,
    imageHeightFromCellWidth: 16 / 9,
    infoBlockPx: 0,
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
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

  const showInternalPagination = !isControlled;

  if (!token) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <p>Sign in to see reels.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <Loader2 size={28} className="reel-grid-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="reel-grid-component reel-grid-component--message">
        <p>Could not load reels.</p>
      </div>
    );
  }

  const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

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
          >
            <video
              className="reel-grid-card-video"
              muted
              playsInline
              preload="metadata"
              src={reel.videoUrl}
            />
            <div className="reel-grid-card-overlay">
              <span className="reel-grid-card-title">{reel.title}</span>
              <span className="reel-grid-card-likes">♥ {reel.likesCount}</span>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="reel-grid-empty">No reels yet. Use + to create one.</p>}
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
