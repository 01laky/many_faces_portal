import { useTranslation } from 'react-i18next';
import { AdGrid } from '../grid/AdGrid';
import { AlbumGrid } from '../grid/AlbumGrid';
import { BlogGrid } from '../grid/BlogGrid';
import { ChatRoomGrid } from '../grid/ChatRoomGrid';
import { VideoLoungeGrid } from '../grid/VideoLoungeGrid';
import { UserProfileGrid } from '../grid/UserProfileGrid';
import { StoryGrid } from '../grid/StoryGrid';
import { ReelGrid } from '../grid/ReelGrid';
import '../../pages/ComponentListPage/ComponentListPage.scss';

/** ComponentTypeId enum matching BE ComponentTypeId. */
const COMPONENT_CONFIG: Record<number, { grid: () => React.ReactNode }> = {
  1: { grid: () => <AdGrid /> },
  2: { grid: () => <AlbumGrid /> },
  3: { grid: () => <BlogGrid /> },
  4: { grid: () => <ChatRoomGrid /> },
  5: { grid: () => <UserProfileGrid /> },
  6: { grid: () => <StoryGrid /> },
  7: { grid: () => <ReelGrid /> },
  8: { grid: () => <VideoLoungeGrid /> },
};

export function ComponentListView({ componentTypeId }: { componentTypeId: number }) {
  const { t } = useTranslation('common');
  const config = COMPONENT_CONFIG[componentTypeId];

  if (!config) {
    return (
      <div className="component-list-page component-list-page--error">
        <p>{t('componentList.notFound', 'Component not found')}</p>
      </div>
    );
  }

  return (
    <div className="component-list-page">
      <div className="component-list-grid">{config.grid()}</div>
    </div>
  );
}
