import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { fetchWallTickets, type WallTicketListItem } from '../../api/services/wallTicketsApi';
import { WallTicketDetailPanel } from '../WallTicketDetailPanel';
import './WallTicketsSection.scss';

interface WallTicketsSectionProps {
	refreshKey?: number;
}

export function WallTicketsSection({ refreshKey = 0 }: WallTicketsSectionProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const [items, setItems] = useState<WallTicketListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [listTick, setListTick] = useState(0);

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
				const res = await fetchWallTickets(token, selectedFace.id, page, 20);
				if (!cancelled) {
					setItems(res.items);
					setTotalPages(Math.max(1, res.totalPages));
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error && err.message ? err.message : t('wallTickets.loadError'));
					setItems([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedFace, token, page, refreshKey, listTick, t]);

	if (!selectedFace) return null;

	if (!token) {
		return (
			<div className="wall-tickets-section">
				<p className="wall-tickets-section__muted">{t('wallTickets.loginRequired')}</p>
			</div>
		);
	}

	const openDetail = (id: number) => setSelectedId(id);
	const closeDetail = () => setSelectedId(null);

	return (
		<div className="wall-tickets-section">
			{loading && <p className="wall-tickets-section__muted">{t('wallTickets.loading')}</p>}
			{error && <p className="wall-tickets-section__error">{error}</p>}
			{!loading && !error && items.length === 0 && (
				<p className="wall-tickets-section__muted">{t('wallTickets.empty')}</p>
			)}
			<ul className="wall-tickets-section__list">
				{items.map((row) => (
					<li key={row.id}>
						<button
							type="button"
							className="wall-tickets-section__card"
							onClick={() => openDetail(row.id)}
						>
							<div className="wall-tickets-section__card-head">
								<span
									className={`wall-tickets-section__status wall-tickets-section__status--${row.status}`}
								>
									{t(`wallTickets.status.${row.status}`, row.status)}
								</span>
								<span className="wall-tickets-section__meta">
									{row.likesCount} ♥ · {row.commentsCount} 💬
								</span>
							</div>
							<h3 className="wall-tickets-section__title">{row.title}</h3>
							<p className="wall-tickets-section__preview">{row.descriptionPreview}</p>
							<span className="wall-tickets-section__author">{row.creatorName}</span>
						</button>
					</li>
				))}
			</ul>
			{totalPages > 1 && (
				<div className="wall-tickets-section__pager">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						{t('wallTickets.prev')}
					</button>
					<span>
						{page} / {totalPages}
					</span>
					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						{t('wallTickets.next')}
					</button>
				</div>
			)}

			<WallTicketDetailPanel
				open={selectedId != null}
				onClose={closeDetail}
				token={token}
				faceId={selectedFace.id}
				ticketId={selectedId}
				onChanged={() => setListTick((x) => x + 1)}
			/>
		</div>
	);
}
