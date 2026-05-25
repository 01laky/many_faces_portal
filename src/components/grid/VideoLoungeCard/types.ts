import type { FaceVideoLoungeDto } from '../../../api/services/VideoLoungesService';

export interface VideoLoungeCardProps {
	lounge: Pick<
		FaceVideoLoungeDto,
		| 'id'
		| 'title'
		| 'memberCount'
		| 'isPublic'
		| 'isSystemManaged'
		| 'hasLiveSession'
		| 'liveParticipantCount'
	>;
	onOpen?: () => void;
	interactive?: boolean;
}
