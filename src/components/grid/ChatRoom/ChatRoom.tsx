/**
 * Single chat room tile: bound to a specific room from grid JSON, or first room in the face.
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../../../constants/componentTypeIds';
import {
	getChatRoom,
	listChatRooms,
	type FaceChatRoomDto,
} from '../../../api/services/ChatRoomsService';
import { ChatRoomCard } from '../ChatRoomCard';
import './ChatRoom.scss';
import type { ChatRoomProps } from './types';

export function ChatRoom({ boundChatRoomId }: ChatRoomProps) {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [room, setRoom] = useState<FaceChatRoomDto | null>(null);
	const [loading, setLoading] = useState(true);

	const goDetail = useCallback(
		(id: number) => {
			navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.chatRoom}/${id}`));
		},
		[navigate, getLocalizedPath]
	);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (!selectedFace || !token) {
				if (!cancelled) setLoading(false);
				return;
			}

			if (!cancelled) setLoading(true);
			try {
				if (boundChatRoomId != null) {
					const r = await getChatRoom(selectedFace.id, boundChatRoomId, token);
					if (!cancelled) setRoom(r);
				} else {
					const list = await listChatRooms(selectedFace.id, token);
					if (!cancelled) setRoom(list[0] ?? null);
				}
			} catch {
				if (!cancelled) setRoom(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [selectedFace, token, boundChatRoomId]);

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
