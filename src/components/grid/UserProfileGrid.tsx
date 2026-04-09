/**
 * UserProfileGrid - Face profile directory (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
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
import {
  useStablePaginationEmit,
  useSyncedPaginationReport,
} from '../../hooks/usePaginationParentSync';
import { useFillGridPagination } from '../../hooks/useFillGridPagination';
import './UserProfileGrid.scss';

export interface UserProfileGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function UserProfileGrid({ page: controlledPage, onPageChange }: UserProfileGridProps = {}) {
  const itemsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const faceId = selectedFace?.id;
  const faceIndex = selectedFace?.index;

  const [profiles, setProfiles] = useState<FaceProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  const observeGrid =
    faceId != null && Boolean(token) && Boolean(faceIndex) && !loading && !loadError;
  const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
    gap: 6,
    minColWidth: 120,
    fixedCardHeightPx: 92,
  });

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

  if (faceId == null || !faceIndex) {
    return (
      <div className="userprofile-grid-component userprofile-grid-component--message">
        <p>Select a face.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="userprofile-grid-component userprofile-grid-component--message">
        <p>Sign in to see profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="userprofile-grid-component userprofile-grid-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="userprofile-grid-component userprofile-grid-component--message">
        <p>Could not load profiles.</p>
      </div>
    );
  }

  const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

  return (
    <div className="userprofile-grid-component">
      <div className="userprofile-grid-items" ref={itemsRef} style={itemsStyle}>
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
