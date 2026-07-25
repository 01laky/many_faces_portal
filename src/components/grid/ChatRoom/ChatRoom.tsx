/**
 * Single chat room tile: bound to a specific room from grid JSON, or first room in the face.
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
import { useChatRoomsGridQuery, useChatRoomBoundGridQuery } from '../../../hooks/api/gridQueries';
import { ChatRoomCard } from '../ChatRoomCard';
import './ChatRoom.scss';
import type { ChatRoomProps } from './types';

export function ChatRoom({ boundChatRoomId }: ChatRoomProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const faceId = selectedFace?.id;

	// TanStack Query migration (PT-RP2 + PT-RP16): an unbound tile reuses the SAME list
	// hook/key as ChatRoomGrid/ChatRoomCarousel (dedup) and shows the first room; a tile
	// bound via `boundChatRoomId` uses the narrow single-item hook instead. Exactly one
	// of the two queries is enabled. Errors leave `data` undefined → empty state,
	// matching the previous useEffect version which nulled the room on failure.
	const fetchEnabled = useGridBlockFetchEnabled();
	const bound = boundChatRoomId != null;
	const listQuery = useChatRoomsGridQuery(token, faceId, fetchEnabled && !bound);
	const boundQuery = useChatRoomBoundGridQuery(token, faceId, boundChatRoomId, fetchEnabled);
	const room = bound ? (boundQuery.data ?? null) : (listQuery.data?.[0] ?? null);
	const loading = bound ? boundQuery.isLoading : listQuery.isLoading;

	const goDetail = useCallback(
		(id: number) => {
			navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.chatRoom}/${id}`));
		},
		[navigate, getLocalizedPath]
	);

	if (!selectedFace || !token) {
		return (
			<div className="chatroom-component chatroom-component--empty">
				<span className="chatroom-empty-text">{t(k.guest.chatRooms)}</span>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="chatroom-component chatroom-component--center">
				<Loader2 className="chatroom-loading" size={24} />
			</div>
		);
	}

	if (!room) {
		return (
			<div className="chatroom-component chatroom-component--empty">
				<span className="chatroom-empty-text">{t(k.empty.chatRooms)}</span>
			</div>
		);
	}

	return (
		<div className="chatroom-component chatroom-component--tile">
			<ChatRoomCard room={room} onOpen={() => goDetail(room.id)} />
		</div>
	);
}
