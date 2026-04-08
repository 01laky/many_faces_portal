/**
 * AdCarousel - Wall tickets carousel for the current face (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import {
  fetchAllWallTicketsForFace,
  type WallTicketListItem,
} from '../../api/services/wallTicketsApi';
import { wallTicketListingImageUrl } from './gridDisplayHelpers';
import './AdCarousel.scss';

const CARD_WIDTH = 160;
const CARD_GAP = 8;

export interface AdCarouselProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function AdCarousel({
  page: controlledPage,
  totalPages: _totalPages,
  onPageChange,
}: AdCarouselProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;

  const [items, setItems] = useState<WallTicketListItem[]>([]);
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
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const list = await fetchAllWallTicketsForFace(token, faceId);
        if (!cancelled) setItems(list);
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

  const totalPages = Math.max(1, Math.ceil(items.length / visibleCount));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleAds = useMemo(
    () => items.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [items, clampedPage, visibleCount]
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
      <div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
        <p>Sign in to see listings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ad-carousel-component ad-carousel-component--message" ref={containerRef}>
        <p>Could not load listings.</p>
      </div>
    );
  }

  return (
    <div className="ad-carousel-component" ref={containerRef}>
      {showInternalNav && (
        <button
          type="button"
          className="ad-carousel-nav ad-carousel-prev"
          disabled={clampedPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
      )}

      <div className="ad-carousel-track">
        {visibleAds.map((ad) => (
          <div key={ad.id} className="ad-carousel-card" style={{ width: CARD_WIDTH }}>
            <img src={wallTicketListingImageUrl(ad.id)} alt={ad.title} loading="lazy" />
            <div className="ad-carousel-card-info">
              <span className="ad-carousel-card-price">Wall</span>
              <span className="ad-carousel-card-title">{ad.title}</span>
              <span className="ad-carousel-card-location">{ad.creatorName}</span>
            </div>
          </div>
        ))}
      </div>

      {showInternalNav && (
        <button
          type="button"
          className="ad-carousel-nav ad-carousel-next"
          disabled={clampedPage >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
      )}

      {showInternalNav && totalPages > 1 && (
        <div className="ad-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`ad-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
