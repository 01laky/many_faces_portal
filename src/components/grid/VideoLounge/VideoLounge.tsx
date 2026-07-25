/**
 * Single video lounge tile: bound to a specific lounge from grid JSON, or first lounge in the face.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../../../constants/componentTypeIds';
import {
	useVideoLoungesGridQuery,
	useVideoLoungeBoundGridQuery,
} from '../../../hooks/api/gridQueries';
import { VideoLoungeCard } from '../VideoLoungeCard';
import './VideoLounge.scss';
import type { VideoLoungeProps } from './types';

export function VideoLounge({ boundVideoLoungeId }: VideoLoungeProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;

	// TanStack Query migration (PT-RP2 + PT-RP16): an unbound tile reuses the SAME list
	// hook/key as VideoLoungeGrid/VideoLoungeCarousel (dedup) and shows the first lounge;
	// a tile bound via `boundVideoLoungeId` uses the narrow single-item hook instead.
	// Exactly one of the two queries is enabled. Errors leave `data` undefined → empty
	// state, matching the previous useEffect version which nulled the lounge on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const bound = boundVideoLoungeId != null;
	const listQuery = useVideoLoungesGridQuery(token, faceId, fetchEnabled && !bound);
	const boundQuery = useVideoLoungeBoundGridQuery(token, faceId, boundVideoLoungeId, fetchEnabled);
	const lounge = bound ? (boundQuery.data ?? null) : (listQuery.data?.[0] ?? null);
	const loading = bound ? boundQuery.isLoading : listQuery.isLoading;

	const goDetail = useCallback(
		(id: number) => {
			navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.videoLounge}/${id}`));
		},
		[navigate, getLocalizedPath]
	);

	if (!selectedFace || !token) {
		return (
			<div className="videolounge-component videolounge-component--empty">
				<span className="videolounge-empty-text">{t(k.guest.videoLounges)}</span>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="videolounge-component videolounge-component--center">
				<Loader2 className="videolounge-loading" size={24} />
			</div>
		);
	}

	if (!lounge) {
		return (
			<div className="videolounge-component videolounge-component--empty">
				<span className="videolounge-empty-text">{t(k.empty.videoLounges)}</span>
			</div>
		);
	}

	return (
		<div className="videolounge-component videolounge-component--tile">
			<VideoLoungeCard lounge={lounge} onOpen={() => goDetail(lounge.id)} />
		</div>
	);
}
