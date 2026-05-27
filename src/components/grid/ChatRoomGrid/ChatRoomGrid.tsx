/**
 * ChatRoomGrid - Paginated grid of chat room cards (API-backed)
 */

import { useState, useRef, useCallback, useMemo, type CSSProperties } from 'react';
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
import { useFillGridPagination } from '../../../hooks/useFillGridPagination';
import './ChatRoomGrid.scss';
import type { ChatRoomGridProps } from './types';

export function ChatRoomGrid({ page: controlledPage, onPageChange }: ChatRoomGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
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
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid = Boolean(selectedFace) && Boolean(token) && !loading;
	const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
		gap: 6,
		minColWidth: 160,
		fixedCardHeightPx: 54,
	});

	const totalPages = Math.max(1, Math.ceil(rooms.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleRooms = useMemo(
		() => rooms.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[clampedPage, itemsPerPage, rooms]
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

	const showInternalPagination = !isControlled;

	const goDetail = (id: number) => {
		navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.chatRoomGrid}/${id}`));
	};

	if (!selectedFace || !token) {
		return (
			<div className="chatroom-grid-component">
				<p className="chatroom-grid-hint">{t(k.guest.chatRooms)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="chatroom-grid-component chatroom-grid-component--center">
				<Loader2 className="chatroom-grid-spinner" size={28} />
			</div>
		);
	}

	const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

	return (
		<div className="chatroom-grid-component">
			<div className="chatroom-grid-items" ref={itemsRef} style={itemsStyle}>
				{visibleRooms.map((room) => (
					<ChatRoomCard key={room.id} room={room} onOpen={() => goDetail(room.id)} />
				))}
			</div>
			{showInternalPagination && totalPages > 1 && (
				<div className="chatroom-grid-pagination">
					<button disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
						‹
					</button>
					<span>
						{clampedPage + 1} / {totalPages}
					</span>
					<button disabled={clampedPage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
						›
					</button>
				</div>
			)}
		</div>
	);
}
