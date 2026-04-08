/**
 * UserProfileGrid - Face profile directory (API-backed)
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
import './UserProfileGrid.scss';

const CARD_MIN_W = 140;
const CARD_MIN_H = 120;

export interface UserProfileGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function UserProfileGrid({ page: controlledPage, onPageChange }: UserProfileGridProps = {}) {
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
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const calcItems = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const paginationHeight = 32;
    const availH = clientHeight - paginationHeight;
    const cols = Math.max(1, Math.floor(clientWidth / CARD_MIN_W));
    const rows = Math.max(1, Math.floor(availH / CARD_MIN_H));
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

  const totalPages = Math.max(1, Math.ceil(profiles.length / itemsPerPage));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleProfiles = useMemo(
    () => profiles.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [profiles, clampedPage, itemsPerPage]
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

  if (faceId == null || !faceIndex) {
    return (
      <div
        className="userprofile-grid-component userprofile-grid-component--message"
        ref={containerRef}
      >
        <p>Select a face.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="userprofile-grid-component userprofile-grid-component--message"
        ref={containerRef}
      >
        <p>Sign in to see profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="userprofile-grid-component userprofile-grid-component--message"
        ref={containerRef}
      >
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="userprofile-grid-component userprofile-grid-component--message"
        ref={containerRef}
      >
        <p>Could not load profiles.</p>
      </div>
    );
  }

  return (
    <div className="userprofile-grid-component" ref={containerRef}>
      <div className="userprofile-grid-items">
        {visibleProfiles.map((profile) => {
          const name = profile.displayName?.trim() || 'Member';
          const path = getLocalizedPath(
            `${faceIndex}/profile/${encodeURIComponent(profile.userId)}`
          );
          return (
            <div
              key={profile.userId}
              className="userprofile-grid-card"
              onClick={() => navigate(path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(path);
              }}
            >
              <img
                className="userprofile-grid-avatar"
                src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
                alt={name}
                loading="lazy"
              />
              <span className="userprofile-grid-card-name">{name}</span>
              <span className="userprofile-grid-card-role">Member</span>
            </div>
          );
        })}
      </div>
      {profiles.length === 0 && <p className="userprofile-grid-empty">No profiles in directory.</p>}
      {showInternalPagination && totalPages > 1 && (
        <div className="userprofile-grid-pagination">
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
