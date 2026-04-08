/**
 * Album - First album for the current face (API-backed preview)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getAlbums, type AlbumItem } from '../../api/services/AlbumsService';
import { albumCoverPlaceholderUrl } from './gridDisplayHelpers';
import './Album.scss';

export function Album() {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const faceId = selectedFace?.id;

  const [album, setAlbum] = useState<AlbumItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || faceId == null) {
      setLoading(false);
      setAlbum(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await getAlbums(token, faceId);
        if (!cancelled) setAlbum(list[0] ?? null);
      } catch {
        if (!cancelled) setAlbum(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  if (!token || faceId == null) {
    return (
      <div className="album-component album-component--message">
        <p>Sign in to see albums.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="album-component album-component--message">
        <Loader2 size={28} aria-label="Loading" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="album-component album-component--message">
        <p>No albums for this face yet.</p>
      </div>
    );
  }

  const thumbs = [0, 1, 2].map((i) => `https://picsum.photos/seed/album${album.id}_t${i}/150/150`);

  return (
    <Link
      className="album-component album-component--link"
      to={getLocalizedPath(`/album/${album.id}`)}
    >
      <img
        className="album-main-photo"
        src={albumCoverPlaceholderUrl(album.id)}
        alt={album.title}
        loading="lazy"
      />
      <div className="album-thumbnails">
        {thumbs.map((src, i) => (
          <img key={i} className="album-thumb" src={src} alt="" loading="lazy" />
        ))}
      </div>
    </Link>
  );
}
