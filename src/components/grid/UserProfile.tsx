/**
 * UserProfile - First face profile in directory (non-host users, API-backed)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  fetchAllFaceProfilesForFace,
  type FaceProfileListItem,
} from '../../api/services/faceProfilesApi';
import { profileAvatarUrl } from './gridDisplayHelpers';
import './UserProfile.scss';

export function UserProfile() {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const faceId = selectedFace?.id;
  const faceIndex = selectedFace?.index;

  const [profile, setProfile] = useState<FaceProfileListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faceId == null || !token) {
      setLoading(false);
      setProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAllFaceProfilesForFace(faceId, token);
        if (!cancelled) setProfile(list[0] ?? null);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [faceId, token]);

  if (faceId == null || !faceIndex) {
    return (
      <div className="userprofile-component userprofile-component--message">
        <p>Select a face to see profiles.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="userprofile-component userprofile-component--message">
        <p>Sign in to see profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="userprofile-component userprofile-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="userprofile-component userprofile-component--message">
        <p>No profiles in this face directory yet.</p>
      </div>
    );
  }

  const name = profile.displayName?.trim() || 'Member';
  const href = getLocalizedPath(`${faceIndex}/profile/${encodeURIComponent(profile.userId)}`);

  return (
    <Link className="userprofile-component userprofile-component--link" to={href}>
      <img
        className="userprofile-avatar"
        src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
        alt={name}
        loading="lazy"
      />
      <div className="userprofile-info">
        <span className="userprofile-name">{name}</span>
        <span className="userprofile-role">Face member</span>
        <span className="userprofile-bio">Open profile for details.</span>
      </div>
    </Link>
  );
}
