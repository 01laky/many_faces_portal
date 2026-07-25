/**
 * Story - First published story bubble for the current face (API-backed)
 */

import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useStoriesGridQuery } from '../../../hooks/api/gridQueries';
import { storyRingImageUrl } from '../gridDisplayHelpers';
import './Story.scss';

export function Story() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;
	const faceIndex = selectedFace?.index;

	// Same TanStack Query hook as StoryGrid/StoryCarousel: shared per-face cache (PT-RP2)
	// and IO-gated fetch (PT-RP16). Unlike the other single tiles this block keeps its
	// distinct load-error message, so `isError` maps to the old `loadError` state.
	const fetchEnabled = useGridBlockFetchEnabled();
	const {
		data: stories = [],
		isLoading: loading,
		isError: loadError,
	} = useStoriesGridQuery(token, faceId, fetchEnabled);
	const story = stories[0] ?? null;

	if (!token || faceId == null || !faceIndex) {
		return (
			<div className="story-component story-component--message">
				<span className="story-empty-text">{t(k.guest.stories)}</span>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="story-component story-component--message">
				<Loader2 size={24} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="story-component story-component--message">
				<span className="story-empty-text">{t(k.loadError.stories)}</span>
			</div>
		);
	}

	if (!story) {
		return (
			<div className="story-component story-component--message">
				<span className="story-empty-text">{t(k.empty.storiesActive)}</span>
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
			<div className="story-thumb">
				<img
					className="story-thumb-img"
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
