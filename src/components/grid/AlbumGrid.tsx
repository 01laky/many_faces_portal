/**
 * AlbumGrid - Paginated grid of album cards (API, current face)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getAlbums, type AlbumItem } from '../../api/services/AlbumsService';
import { albumCoverPlaceholderUrl } from './gridDisplayHelpers';
import './AlbumGrid.scss';

const ALBUM_CARD_MIN_W = 140;
const ALBUM_CARD_MIN_H = 160;

export interface AlbumGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function AlbumGrid({ page: controlledPage, onPageChange }: AlbumGridProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const calcItems = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const headerHeight = 36;
    const paginationHeight = 32;
    const availH = clientHeight - headerHeight - paginationHeight;
    const cols = Math.max(1, Math.floor(clientWidth / ALBUM_CARD_MIN_W));
    const rows = Math.max(1, Math.floor(availH / ALBUM_CARD_MIN_H));
    setItemsPerPage(cols * rows);
  }, []);

  useEffect(() => {
    calcItems();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcItems());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcItems]);

  useEffect(() => {
    if (!token || faceId == null) {
      setAlbums([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const list = await getAlbums(token, faceId);
        if (!cancelled) setAlbums(list);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setAlbums([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  const totalPages = Math.max(1, Math.ceil(albums.length / itemsPerPage));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAlbums = useMemo(
    () => albums.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [albums, clampedPage, itemsPerPage]
  );

  useEffect(() => {
    onPageChange?.(clampedPage, totalPages);
  }, [clampedPage, totalPages, onPageChange]);

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const next =
        typeof value === 'function'
          ? value(isControlled ? (controlledPage ?? 0) : internalPage)
          : value;
      if (isControlled) onPageChange?.(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
      else setInternalPage(next);
    },
    [isControlled, controlledPage, internalPage, totalPages, onPageChange]
  );

  const showInternalPagination = !isControlled;

  if (!token || faceId == null) {
    return (
      <div className="album-grid-component album-grid-component--message" ref={containerRef}>
        <p>Sign in to see albums.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="album-grid-component album-grid-component--message" ref={containerRef}>
        <Loader2 size={28} className="album-grid-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="album-grid-component album-grid-component--message" ref={containerRef}>
        <p>Could not load albums.</p>
      </div>
    );
  }

  return (
    <div className="album-grid-component" ref={containerRef}>
      <div className="album-grid-items">
        {visibleAlbums.map((album) => (
          <div
            key={album.id}
            className="album-grid-card"
            onClick={() => navigate(getLocalizedPath(`/album/${album.id}`))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(getLocalizedPath(`/album/${album.id}`));
            }}
          >
            <img src={albumCoverPlaceholderUrl(album.id)} alt={album.title} loading="lazy" />
            <div className="album-grid-card-info">
              <span className="album-grid-card-title">{album.title}</span>
              <span className="album-grid-card-count">
                ♥ {album.likesCount} · 💬 {album.commentsCount}
              </span>
            </div>
          </div>
        ))}
      </div>
      {albums.length === 0 && <p className="album-grid-empty">No albums for this face yet.</p>}
      {showInternalPagination && totalPages > 1 && (
        <div className="album-grid-pagination">
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
