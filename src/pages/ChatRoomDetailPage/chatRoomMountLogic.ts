import type { FaceChatRoomDto, FaceChatRoomMessageDto } from '@/api/services/ChatRoomsService';

/** PT-RP10 — parallel mount: messages only when viewer may read the room. */
export function resolveChatRoomMountMessages(
	room: FaceChatRoomDto | null,
	messagesResult: PromiseSettledResult<FaceChatRoomMessageDto[]>
): FaceChatRoomMessageDto[] {
	if (!room) return [];
	if (room.isHostViewer || room.isMember) {
		return messagesResult.status === 'fulfilled' ? messagesResult.value : [];
	}
	return [];
}

export function resolveChatRoomMountRoom(roomResult: PromiseSettledResult<FaceChatRoomDto>): {
	room: FaceChatRoomDto | null;
	loadError: boolean;
} {
	if (roomResult.status === 'fulfilled') {
		return { room: roomResult.value, loadError: false };
	}
	return { room: null, loadError: true };
}
