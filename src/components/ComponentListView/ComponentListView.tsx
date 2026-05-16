import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AdGrid } from '../grid/AdGrid';
import { AlbumGrid } from '../grid/AlbumGrid';
import { BlogGrid } from '../grid/BlogGrid';
import { ChatRoomGrid } from '../grid/ChatRoomGrid';
import { UserProfileGrid } from '../grid/UserProfileGrid';
import { StoryGrid } from '../grid/StoryGrid';
import { ReelGrid } from '../grid/ReelGrid';
import '../../pages/ComponentListPage/ComponentListPage.scss';

/** ComponentTypeId enum matching BE ComponentTypeId. */
const COMPONENT_CONFIG: Record<number, { title: string; grid: () => React.ReactNode }> = {
  1: { title: 'Ads', grid: () => <AdGrid /> },
  2: { title: 'Albums', grid: () => <AlbumGrid /> },
  3: { title: 'Blog', grid: () => <BlogGrid /> },
  4: { title: 'Chat Rooms', grid: () => <ChatRoomGrid /> },
  5: { title: 'User Profiles', grid: () => <UserProfileGrid /> },
  6: { title: 'Stories', grid: () => <StoryGrid /> },
  7: { title: 'Reels', grid: () => <ReelGrid /> },
};

export function ComponentListView({
  componentTypeId,
  onBack,
}: {
  componentTypeId: number;
  onBack?: () => void;
}) {
  const { t } = useTranslation('common');
  const config = COMPONENT_CONFIG[componentTypeId];

  if (!config) {
    return (
      <div className="component-list-page component-list-page--error">
        <h2>{t('componentList.notFound', 'Component not found')}</h2>
        {onBack && (
          <button type="button" className="component-list-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            {t('common.back', 'Back')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="component-list-page">
      <div className="component-list-header">
        {onBack && (
          <button type="button" className="component-list-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            {t('common.back', 'Back')}
          </button>
        )}
        <h1 className="component-list-title">{config.title}</h1>
      </div>
      <div className="component-list-grid">{config.grid()}</div>
    </div>
  );
}
