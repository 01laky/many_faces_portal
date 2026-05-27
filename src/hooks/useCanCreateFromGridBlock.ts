import { useAuth } from '@/contexts/AuthContext';
import { useMeCapabilities } from '@/hooks/api/useMeCapabilities';
import { hasFaceMember } from '@/acl/permissions';
import type { GridComponentType } from '@/utils/pageGridSchema';
import { useFaceConfig } from '@/contexts/FaceConfigContext';
import {
	ALBUM_COMPONENT_TYPES,
	BLOG_COMPONENT_TYPES,
	CHAT_ROOM_COMPONENT_TYPES,
	REEL_COMPONENT_TYPES,
	VIDEO_LOUNGE_COMPONENT_TYPES,
} from '@/components/ComponentBlock/constants';

/** Unified create gate using capabilities Query + face flags (PT-RP28). */
export function useCanCreateFromGridBlock(componentType: GridComponentType): {
	canCreate: boolean;
	reason: 'ok' | 'guest' | 'unsupported' | 'faceFlag' | 'host' | 'acl';
} {
	const { token, isAuthenticated } = useAuth();
	const { selectedFace } = useFaceConfig();
	const { data: caps } = useMeCapabilities(token, isAuthenticated);

	if (!isAuthenticated || !token) {
		return { canCreate: false, reason: 'guest' };
	}

	const isAlbum = ALBUM_COMPONENT_TYPES.includes(componentType);
	const isBlog = BLOG_COMPONENT_TYPES.includes(componentType);
	const isReel = REEL_COMPONENT_TYPES.includes(componentType);
	const isChatRoom = CHAT_ROOM_COMPONENT_TYPES.includes(componentType);
	const isVideoLounge = VIDEO_LOUNGE_COMPONENT_TYPES.includes(componentType);
	const isFaceHost = selectedFace?.myFaceRoleName === 'FACE_HOST';

	const unsupported =
		componentType.startsWith('ad') ||
		componentType.startsWith('story') ||
		componentType.startsWith('userProfile');

	if (unsupported) {
		return { canCreate: false, reason: 'unsupported' };
	}

	if (isChatRoom) {
		if (isFaceHost) return { canCreate: false, reason: 'host' };
		if (!selectedFace?.chatRoomsCreate) return { canCreate: false, reason: 'faceFlag' };
	}

	if (isVideoLounge) {
		if (isFaceHost) return { canCreate: false, reason: 'host' };
		if (!selectedFace?.videoLoungesCreate) return { canCreate: false, reason: 'faceFlag' };
	}

	if ((isAlbum || isBlog || isReel) && !hasFaceMember(caps)) {
		return { canCreate: false, reason: 'acl' };
	}

	return { canCreate: true, reason: 'ok' };
}
