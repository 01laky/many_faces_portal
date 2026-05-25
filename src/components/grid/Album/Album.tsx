/**
 * Album - First album for the current face (API-backed preview)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getAlbums, type AlbumItem } from '../../../api/services/AlbumsService';
import { albumCoverPlaceholderUrl, albumThumbnailPlaceholderUrl } from '../gridDisplayHelpers';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import './Album.scss';

export function Album() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;

	const [album, setAlbum] = useState<AlbumItem | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!token || faceId == null) {
				if (!cancelled) {
					setLoading(false);
					setAlbum(null);
				}
				return;
			}
			if (!cancelled) setLoading(true);
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
