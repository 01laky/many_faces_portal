/**
 * ChatRoomCarousel - Horizontal carousel of chat room cards (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useChatRoomsGridQuery } from '../../../hooks/api/gridQueries';
import { COMPONENT_TYPE_ID } from '../../../constants/componentTypeIds';
import { ChatRoomCard } from '../ChatRoomCard';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './ChatRoomCarousel.scss';
import type { ChatRoomCarouselProps } from './types';
import { CARD_WIDTH, CARD_GAP } from './constants';

export function ChatRoomCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: ChatRoomCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;
	const fetchEnabled = useGridBlockFetchEnabled();
	const { data: rooms = [], isLoading: loading } = useChatRoomsGridQuery(
		token,
		faceId,
		fetchEnabled
	);
	const [visibleCount, setVisibleCount] = useState(2);
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const calcVisible = useCallback(() => {
		if (!containerRef.current) return;
		const w = containerRef.current.clientWidth - 60;
		const count = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
		setVisibleCount(count);
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		queueMicrotask(() => calcVisible());
		const ro = new ResizeObserver(() => calcVisible());
		ro.observe(el);
		return () => ro.disconnect();
	}, [calcVisible]);

	const totalPages = Math.max(1, Math.ceil(rooms.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleRooms = useMemo(
		() => rooms.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[clampedPage, visibleCount, rooms]
	);

	const emitPage = useStablePaginationEmit(onPageChange);
	useSyncedPaginationReport(emitPage, clampedPage, totalPages);

	const setPage = useCallback(
		(value: number | ((prev: number) => number)) => {
			const next =
				typeof value === 'function'
					? value(isControlled ? (controlledPage ?? 0) : internalPage)
					: value;
			if (isControlled) emitPage(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
			else setInternalPage(next);
		},
		[isControlled, controlledPage, internalPage, totalPages, emitPage]
	);

	const showInternalNav = !isControlled;

	const goDetail = (id: number) => {
		navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.chatRoomCarousel}/${id}`));
	};

	if (!selectedFace || !token) {
		return (
			<div className="chatroom-carousel-component" ref={containerRef}>
				<p className="chatroom-carousel-hint">{t(k.guest.chatRooms)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="chatroom-carousel-component chatroom-carousel-component--center"
				ref={containerRef}
			>
				<Loader2 className="chatroom-carousel-spinner" size={28} />
			</div>
		);
	}

	return (
		<div className="chatroom-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					className="chatroom-carousel-nav chatroom-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="chatroom-carousel-track">
				{visibleRooms.map((room) => (
					<div key={room.id} className="chatroom-carousel-slot" style={{ width: CARD_WIDTH }}>
						<ChatRoomCard room={room} onOpen={() => goDetail(room.id)} />
					</div>
				))}
			</div>

			{showInternalNav && (
				<button
					className="chatroom-carousel-nav chatroom-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="chatroom-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`chatroom-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
