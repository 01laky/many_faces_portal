/**
 * AlbumCarousel - Horizontal carousel of albums for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getAlbums, type AlbumItem } from '../../api/services/AlbumsService';
import { albumCoverPlaceholderUrl } from './gridDisplayHelpers';
import './AlbumCarousel.scss';

const CARD_WIDTH = 160;
const CARD_GAP = 8;

export interface AlbumCarouselProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function AlbumCarousel({
  page: controlledPage,
  totalPages: _totalPages,
  onPageChange,
}: AlbumCarouselProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const calcVisible = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth - 60;
    const count = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
    setVisibleCount(count);
  }, []);

  useEffect(() => {
    calcVisible();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcVisible());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcVisible]);

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

  const totalPages = Math.max(1, Math.ceil(albums.length / visibleCount));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAlbums = useMemo(
    () => albums.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [albums, clampedPage, visibleCount]
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

  const showInternalNav = !isControlled;

  if (!token || faceId == null) {
    return (
      <div
        className="album-carousel-component album-carousel-component--message"
        ref={containerRef}
      >
        <p>Sign in to see albums.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="album-carousel-component album-carousel-component--message"
        ref={containerRef}
      >
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="album-carousel-component album-carousel-component--message"
        ref={containerRef}
      >
        <p>Could not load albums.</p>
      </div>
    );
  }

  return (
    <div className="album-carousel-component" ref={containerRef}>
      {showInternalNav && (
        <button
          type="button"
          className="album-carousel-nav album-carousel-prev"
          disabled={clampedPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
      )}

      <div className="album-carousel-track">
        {visibleAlbums.map((album) => (
          <div
            key={album.id}
            className="album-carousel-card"
            style={{ width: CARD_WIDTH }}
            onClick={() => navigate(getLocalizedPath(`/album/${album.id}`))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(getLocalizedPath(`/album/${album.id}`));
            }}
          >
            <img src={albumCoverPlaceholderUrl(album.id)} alt={album.title} loading="lazy" />
            <div className="album-carousel-card-info">
              <span className="album-carousel-card-title">{album.title}</span>
              <span className="album-carousel-card-count">
                ♥ {album.likesCount} · 💬 {album.commentsCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showInternalNav && (
        <button
          type="button"
          className="album-carousel-nav album-carousel-next"
          disabled={clampedPage >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
      )}

      {showInternalNav && totalPages > 1 && (
        <div className="album-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`album-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
