/**
 * UserProfileCarousel - Face profiles carousel (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  fetchAllFaceProfilesForFace,
  type FaceProfileListItem,
} from '../../api/services/faceProfilesApi';
import { profileAvatarUrl } from './gridDisplayHelpers';
import './UserProfileCarousel.scss';

const CARD_WIDTH = 140;
const CARD_GAP = 8;

export interface UserProfileCarouselProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function UserProfileCarousel({
  page: controlledPage,
  totalPages: _totalPages,
  onPageChange,
}: UserProfileCarouselProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;
  const faceIndex = selectedFace?.index;

  const [profiles, setProfiles] = useState<FaceProfileListItem[]>([]);
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
    if (faceId == null || !token) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const list = await fetchAllFaceProfilesForFace(faceId, token);
        if (!cancelled) setProfiles(list);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setProfiles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [faceId, token]);

  const totalPages = Math.max(1, Math.ceil(profiles.length / visibleCount));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleProfiles = useMemo(
    () => profiles.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
    [profiles, clampedPage, visibleCount]
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

  if (faceId == null || !faceIndex) {
    return (
      <div
        className="userprofile-carousel-component userprofile-carousel-component--message"
        ref={containerRef}
      >
        <p>Select a face.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="userprofile-carousel-component userprofile-carousel-component--message"
        ref={containerRef}
      >
        <p>Sign in to see profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="userprofile-carousel-component userprofile-carousel-component--message"
        ref={containerRef}
      >
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="userprofile-carousel-component userprofile-carousel-component--message"
        ref={containerRef}
      >
        <p>Could not load profiles.</p>
      </div>
    );
  }

  return (
    <div className="userprofile-carousel-component" ref={containerRef}>
      {showInternalNav && (
        <button
          type="button"
          className="userprofile-carousel-nav userprofile-carousel-prev"
          disabled={clampedPage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
      )}

      <div className="userprofile-carousel-track">
        {visibleProfiles.map((profile) => {
          const name = profile.displayName?.trim() || 'Member';
          const path = getLocalizedPath(
            `${faceIndex}/profile/${encodeURIComponent(profile.userId)}`
          );
          return (
            <div
              key={profile.userId}
              className="userprofile-carousel-card"
              style={{ width: CARD_WIDTH }}
              onClick={() => navigate(path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(path);
              }}
            >
              <img
                className="userprofile-carousel-avatar"
                src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
                alt={name}
                loading="lazy"
              />
              <span className="userprofile-carousel-card-name">{name}</span>
              <span className="userprofile-carousel-card-role">Member</span>
            </div>
          );
        })}
      </div>

      {showInternalNav && (
        <button
          type="button"
          className="userprofile-carousel-nav userprofile-carousel-next"
          disabled={clampedPage >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
      )}

      {showInternalNav && totalPages > 1 && (
        <div className="userprofile-carousel-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`userprofile-carousel-dot ${i === clampedPage ? 'active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
