import type { ReactNode } from 'react';
import { AdGrid } from '../grid/AdGrid';
import { AlbumGrid } from '../grid/AlbumGrid';
import { BlogGrid } from '../grid/BlogGrid';
import { ChatRoomGrid } from '../grid/ChatRoomGrid';
import { VideoLoungeGrid } from '../grid/VideoLoungeGrid';
import { UserProfileGrid } from '../grid/UserProfileGrid';
import { StoryGrid } from '../grid/StoryGrid';
import { ReelGrid } from '../grid/ReelGrid';

export const COMPONENT_CONFIG: Record<number, { grid: () => ReactNode }> = {
	1: { grid: () => <AdGrid /> },
	2: { grid: () => <AlbumGrid /> },
	3: { grid: () => <BlogGrid /> },
	4: { grid: () => <ChatRoomGrid /> },
	5: { grid: () => <UserProfileGrid /> },
	6: { grid: () => <StoryGrid /> },
	7: { grid: () => <ReelGrid /> },
	8: { grid: () => <VideoLoungeGrid /> },
};
