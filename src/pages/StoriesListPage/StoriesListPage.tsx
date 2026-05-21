import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon } from 'lucide-react';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { env } from '../../config/env';
import { fetchStoriesForFace, type StoryListItem } from '../../api/services/storiesApi';
import './StoriesListPage.scss';

export function StoriesListPage() {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const { token } = useAuth();
  const [items, setItems] = useState<StoryListItem[]>([]);
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
        const data = await fetchStoriesForFace(token, selectedFace.id);
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(t('stories.loadError'));
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

  return (
    <div className="stories-list-page">
      {loading && <p className="stories-list-page__muted">{t('stories.loading')}</p>}
      {error && <p className="stories-list-page__error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="stories-list-page__muted">{t('stories.empty')}</p>
      )}
      <ul className="stories-list-page__grid">
        {items.map((row) => (
          <li key={row.id} className="stories-list-page__card">
            <div className="stories-list-page__thumb">
              {row.coverUrl ? (
                <img
                  src={row.coverUrl.startsWith('/') ? `${env.apiUrl}${row.coverUrl}` : row.coverUrl}
                  alt=""
                />
              ) : (
                <ImageIcon size={40} strokeWidth={1.25} />
              )}
            </div>
            <div className="stories-list-page__meta">
              <span className="stories-list-page__title">{row.title}</span>
              <span className="stories-list-page__author">{row.creatorName || row.creatorId}</span>
              <span className="stories-list-page__muted">
                {row.imageCount} {t('stories.slides')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
