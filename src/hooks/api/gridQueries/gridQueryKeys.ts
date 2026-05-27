/** TanStack Query keys for face-scoped grid list data (PT-RP2). */
export const gridQueryKeys = {
	all: ['face'] as const,
	face: (faceId: number) => [...gridQueryKeys.all, faceId] as const,
	albums: (faceId: number) => [...gridQueryKeys.face(faceId), 'albums'] as const,
	blogs: (faceId: number) => [...gridQueryKeys.face(faceId), 'blogs'] as const,
	stories: (faceId: number) => [...gridQueryKeys.face(faceId), 'stories'] as const,
	reels: (faceId: number) => [...gridQueryKeys.face(faceId), 'reels'] as const,
	ads: (faceId: number) => [...gridQueryKeys.face(faceId), 'ads'] as const,
	userProfiles: (faceId: number) => [...gridQueryKeys.face(faceId), 'userProfiles'] as const,
	chatRooms: (faceId: number) => [...gridQueryKeys.face(faceId), 'chatRooms'] as const,
	videoLounges: (faceId: number) => [...gridQueryKeys.face(faceId), 'videoLounges'] as const,
};

/** Max parallel REST calls on face home (PT-RP20 / PT-RP29 budget). */
export const FACE_HOME_API_BUDGET = 8;
