import type { FaceChatRoomDto } from '../../../api/services/ChatRoomsService';

export interface ChatRoomCardProps {
	room: Pick<
		FaceChatRoomDto,
		'id' | 'title' | 'memberCount' | 'lastMessageAt' | 'isPublic' | 'isSystemManaged'
	>;
	onOpen?: () => void;
	/** When false, card is not keyboard-focusable / no pointer cursor */
	interactive?: boolean;
}
