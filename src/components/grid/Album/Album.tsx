/**
 * Album - First album for the current face (API-backed preview)
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useAlbumsGridQuery } from '../../../hooks/api/gridQueries';
import { albumCoverPlaceholderUrl, albumThumbnailPlaceholderUrl } from '../gridDisplayHelpers';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import './Album.scss';

export function Album() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;

	// Same TanStack Query hook as AlbumGrid/AlbumCarousel: one shared cache entry per
	// face (PT-RP2 dedup) and fetch deferred until the tile is visible (PT-RP16).
	// A load error leaves `data` undefined, so the tile degrades to the empty state —
	// identical to the previous useEffect version which nulled the item on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: albums = [], isLoading: loading } = useAlbumsGridQuery(token, faceId, fetchEnabled);
	const album = albums[0] ?? null;

	if (!token || faceId == null) {
		return (
			<div className="album-component album-component--message">
				<p>{t(k.guest.albums)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="album-component album-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (!album) {
		return (
			<div className="album-component album-component--message">
				<p>{t(k.empty.albumsFace)}</p>
			</div>
		);
	}

	const thumbs = [0, 1, 2].map((i) => albumThumbnailPlaceholderUrl(album.id, i));

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
