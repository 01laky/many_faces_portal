/**
 * Ad - First wall ticket (listing-style) for the current face
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import {
	fetchAllWallTicketsForFace,
	type WallTicketListItem,
} from '../../../api/services/wallTicketsApi';
import { wallTicketListingImageUrl } from '../gridDisplayHelpers';
import './Ad.scss';

export function Ad() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;

	const [ticket, setTicket] = useState<WallTicketListItem | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!token || faceId == null) {
				if (!cancelled) {
					setLoading(false);
					setTicket(null);
				}
				return;
			}
			if (!cancelled) setLoading(true);
			try {
				const list = await fetchAllWallTicketsForFace(token, faceId);
				if (!cancelled) setTicket(list[0] ?? null);
			} catch {
				if (!cancelled) setTicket(null);
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
