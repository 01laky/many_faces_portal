import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCircle } from 'lucide-react';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { fetchFaceProfiles, type FaceProfileListItem } from '../../api/services/faceProfilesApi';
import './FaceProfilesListPage.scss';

export function FaceProfilesListPage() {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const { token } = useAuth();
  const getLocalizedPath = useLocalizedLink();
  const [items, setItems] = useState<FaceProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!selectedFace || !token) {
        if (!cancelled) {
          setLoading(false);
          setItems([]);
        }
        return;
      }
      try {
        if (!cancelled) setLoading(true);
        const data = await fetchFaceProfiles(selectedFace.id, token, 1, 100);
        if (!cancelled) {
          setItems(data.items);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(t('faceProfiles.loadError'));
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFace, token, t]);

  if (!selectedFace) return null;

  const base = `/${selectedFace.index}/profile`;

  return (
    <div className="face-profiles-list-page">
      {loading && <p className="face-profiles-list-page__muted">{t('faceProfiles.loading')}</p>}
      {error && <p className="face-profiles-list-page__error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="face-profiles-list-page__muted">{t('faceProfiles.empty')}</p>
      )}
      <ul className="face-profiles-list-page__grid">
        {items.map((row) => (
          <li key={row.userId}>
            <Link
              to={getLocalizedPath(`${base}/${encodeURIComponent(row.userId)}`)}
              className="face-profiles-list-page__card"
            >
              <div className="face-profiles-list-page__avatar">
                {row.avatarUrl ? (
                  <img src={row.avatarUrl} alt="" />
                ) : (
                  <UserCircle size={48} strokeWidth={1.25} />
                )}
              </div>
              <span className="face-profiles-list-page__name">
                {row.displayName || row.userId.slice(0, 8)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
