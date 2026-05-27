import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useWallTicketsQuery } from '@/hooks/api/useWallTicketsQuery';
import { WallTicketDetailPanel } from '../WallTicketDetailPanel';
import './WallTicketsSection.scss';
import type { WallTicketsSectionProps } from './types';

export function WallTicketsSection({ refreshKey = 0 }: WallTicketsSectionProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [listTick, setListTick] = useState(0);

	const { data, isLoading, isError, error, refetch } = useWallTicketsQuery(
		token,
		selectedFace?.id,
		page,
		20,
		Boolean(selectedFace && token)
	);

	useEffect(() => {
		if (!selectedFace || !token) return;
		void refetch();
	}, [refreshKey, listTick, refetch, selectedFace, token]);

	const items = data?.items ?? [];
	const totalPages = Math.max(1, data?.totalPages ?? 1);
	const errorMessage =
		isError && error instanceof Error && error.message
			? error.message
			: isError
				? t('wallTickets.loadError')
				: null;

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
			{isLoading && <p className="wall-tickets-section__muted">{t('wallTickets.loading')}</p>}
			{errorMessage && <p className="wall-tickets-section__error">{errorMessage}</p>}
			{!isLoading && !errorMessage && items.length === 0 && (
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
