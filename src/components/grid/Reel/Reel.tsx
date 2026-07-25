/**
 * Reel - Shows the first reel for the current face with link to detail.
 */

import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useReelsGridQuery } from '../../../hooks/api/gridQueries';
import { ReelVideo } from '../ReelVideo';
import './Reel.scss';

export function Reel() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;

	// Same TanStack Query hook as ReelGrid/ReelCarousel: shared per-face cache (PT-RP2)
	// and IO-gated fetch (PT-RP16). Errors leave `data` undefined → empty state, matching
	// the previous useEffect version which nulled the item on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: reels = [], isLoading: loading } = useReelsGridQuery(token, faceId, fetchEnabled);
	const item = reels[0] ?? null;

	if (!token || faceId == null) {
		return (
			<div className="reel-component reel-component--message">
				<p>{t(k.guest.reels)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="reel-component reel-component--message">
				<Loader2 size={28} className="reel-component-spinner" aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (!item) {
		return (
			<div className="reel-component reel-component--message">
				<p>{t(k.empty.reelsAdd)}</p>
			</div>
		);
	}

	return (
		<div className="reel-component">
			<Link className="reel-component-link" to={getLocalizedPath(`/reel/${item.id}`)}>
				<ReelVideo
					className="reel-video"
					muted
					playsInline
					preload="metadata"
					videoUrl={item.videoUrl}
				/>
				<div className="reel-play-overlay">▶</div>
				<div className="reel-overlay">
					<div className="reel-engagement">
						<span className="reel-stat">♥ {item.likesCount}</span>
						<span className="reel-stat">💬 {item.commentsCount}</span>
					</div>
					<div className="reel-author">
						<span className="reel-author-name">{item.title}</span>
					</div>
				</div>
			</Link>
		</div>
	);
}
