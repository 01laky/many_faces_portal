/**
 * Ad - First wall ticket (listing-style) for the current face
 */

import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useAdsGridQuery } from '../../../hooks/api/gridQueries';
import { wallTicketListingImageUrl } from '../gridDisplayHelpers';
import './Ad.scss';

export function Ad() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	// Same TanStack Query hook as AdGrid/AdCarousel: shared per-face cache (PT-RP2)
	// and IO-gated fetch (PT-RP16). Errors leave `data` undefined → empty state, matching
	// the previous useEffect version which nulled the ticket on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: tickets = [], isLoading: loading } = useAdsGridQuery(token, faceId, fetchEnabled);
	const ticket = tickets[0] ?? null;

	if (!token || faceId == null) {
		return (
			<div className="ad-component ad-component--message">
				<span className="ad-empty-text">{t(k.guest.listings)}</span>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="ad-component ad-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className="ad-component ad-component--message">
				<span className="ad-empty-text">{t(k.empty.listingsWall)}</span>
			</div>
		);
	}

	return (
		<div className="ad-component">
			<img
				className="ad-photo"
				src={wallTicketListingImageUrl(ticket.id)}
				alt={ticket.title}
				loading="lazy"
			/>
			<div className="ad-overlay">
				<span className="ad-price">{t(k.wallLabel)}</span>
				<span className="ad-title">{ticket.title}</span>
				<span className="ad-location">{ticket.creatorName}</span>
			</div>
		</div>
	);
}
