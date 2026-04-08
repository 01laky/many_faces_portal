/**
 * Story - First published story bubble for the current face (API-backed)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { fetchStoriesForFace, type StoryListItem } from '../../api/services/storiesApi';
import { storyRingImageUrl } from './gridDisplayHelpers';
import './Story.scss';

export function Story() {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const faceId = selectedFace?.id;
  const faceIndex = selectedFace?.index;

  const [story, setStory] = useState<StoryListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || faceId == null) {
      setLoading(false);
      setStory(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchStoriesForFace(token, faceId);
        if (!cancelled) setStory(list[0] ?? null);
      } catch {
        if (!cancelled) setStory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  if (!token || faceId == null || !faceIndex) {
    return (
      <div className="story-component story-component--message">
        <span className="story-empty-text">Sign in to see stories.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="story-component story-component--message">
        <Loader2 size={24} aria-label="Loading" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-component story-component--message">
        <span className="story-empty-text">No active stories.</span>
      </div>
    );
  }

  const href = getLocalizedPath(`${faceIndex}/stories`);
  const time =
    story.publishedAt != null
      ? new Date(story.publishedAt).toLocaleString(undefined, { day: 'numeric', month: 'short' })
      : '';

  return (
    <Link className="story-component story-component--link" to={href}>
      <div className="story-ring">
        <img
          className="story-avatar"
          src={storyRingImageUrl(story.id, story.coverUrl)}
          alt={story.title}
          loading="lazy"
        />
      </div>
      <span className="story-username">{story.creatorName || 'Story'}</span>
      {time ? <span className="story-time">{time}</span> : null}
    </Link>
  );
}
