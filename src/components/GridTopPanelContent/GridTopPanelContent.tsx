import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../../constants/componentTypeIds';
import { ChatRoomForm } from '../grid/ChatRoomForm';
import { AlbumForm } from '../grid/AlbumForm';
import { BlogForm } from '../grid/BlogForm';
import { ReelForm } from '../grid/ReelForm';
import type { GridComponentType } from '../PageGridLayout';
import { GRID_TOP_PANEL_CREATE_LABEL } from '../gridTopPanelCreateMeta';

const ALBUM_TYPES: GridComponentType[] = ['album', 'albumGrid', 'albumCarousel'];
const BLOG_TYPES: GridComponentType[] = ['blog', 'blogGrid', 'blogCarousel'];
const REEL_TYPES: GridComponentType[] = ['reel', 'reelGrid', 'reelCarousel'];
const CHAT_TYPES: GridComponentType[] = ['chatRoom', 'chatRoomGrid', 'chatRoomCarousel'];
const UNSUPPORTED_CREATE_COPY_KEY: Partial<Record<GridComponentType, string>> = {
  ad: 'gridBlocks.createUnsupported.ad',
  adGrid: 'gridBlocks.createUnsupported.ad',
  adCarousel: 'gridBlocks.createUnsupported.ad',
  story: 'gridBlocks.createUnsupported.story',
  storyGrid: 'gridBlocks.createUnsupported.story',
  storyCarousel: 'gridBlocks.createUnsupported.story',
  userProfile: 'gridBlocks.createUnsupported.userProfile',
  userProfileGrid: 'gridBlocks.createUnsupported.userProfile',
  userProfileCarousel: 'gridBlocks.createUnsupported.userProfile',
};

type GridTopPanelContentProps = {
  state: { mode: 'create'; componentType: GridComponentType };
  /** After successful create — close whole top panel */
  onSavedClose: () => void;
  /** Cancel / back — clear grid view, keep panel open on settings tabs */
  onCancel: () => void;
};

function GridTopPanelCreateBody({
  componentType,
  onSavedClose,
  onCancel,
}: {
  componentType: GridComponentType;
  onSavedClose: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const defaultsTitle = GRID_TOP_PANEL_CREATE_LABEL[componentType];

  const isAlbumType = ALBUM_TYPES.includes(componentType);
  const isBlogType = BLOG_TYPES.includes(componentType);
  const isReelType = REEL_TYPES.includes(componentType);
  const isChatRoomType = CHAT_TYPES.includes(componentType);
  const isFaceHost = selectedFace?.myFaceRoleName === 'FACE_HOST';
  const canCreateChatRoom = isChatRoomType && selectedFace?.chatRoomsCreate === true && !isFaceHost;

  const handleChatRoomSaved = useCallback(
    (roomId: number) => {
      toast.success('Chat room created');
      onSavedClose();
      navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID[componentType]}/${roomId}`));
    },
    [navigate, getLocalizedPath, componentType, onSavedClose]
  );

  if (isAlbumType) {
    return <AlbumForm onSaved={onSavedClose} onCancel={onCancel} />;
  }
  if (isBlogType) {
    return <BlogForm onSaved={onSavedClose} onCancel={onCancel} />;
  }
  if (isReelType) {
    return <ReelForm onSaved={onSavedClose} onCancel={onCancel} />;
  }
  if (isChatRoomType && canCreateChatRoom) {
    return <ChatRoomForm onSaved={handleChatRoomSaved} onCancel={onCancel} />;
  }
  if (isChatRoomType && !canCreateChatRoom) {
    return (
      <div className="grid-top-panel-create-fallback">
        <p>
          {isFaceHost
            ? t(
                'gridBlocks.createUnsupported.faceHostChatRoom',
                'Face hosts can browse chat rooms but cannot create them or participate.'
              )
            : t(
                'gridBlocks.createUnsupported.chatRoomDisabled',
                'Creating chat rooms is not enabled for this face.'
              )}
        </p>
      </div>
    );
  }

  const unsupportedCopyKey = UNSUPPORTED_CREATE_COPY_KEY[componentType];
  if (unsupportedCopyKey) {
    return (
      <div className="grid-top-panel-create-fallback">
        <h3 className="grid-top-panel-create-heading">
          {t('gridBlocks.createUnsupported.heading', '{{label}} creation is not available here', {
            label: defaultsTitle,
          })}
        </h3>
        <p className="grid-top-panel-create-desc">{t(unsupportedCopyKey)}</p>
      </div>
    );
  }

  return (
    <div className="grid-top-panel-create-fallback">
      <h3 className="grid-top-panel-create-heading">Create new {defaultsTitle}</h3>
      <p className="grid-top-panel-create-desc">
        Form for creating new content (configured per component type).
      </p>
      <input
        type="text"
        className="grid-top-panel-create-input"
        placeholder="Title"
        aria-label="Title"
      />
    </div>
  );
}

export function GridTopPanelContent({ state, onSavedClose, onCancel }: GridTopPanelContentProps) {
  return (
    <div className="settings-panel-body-fill grid-top-panel-body grid-top-panel-body--create">
      <GridTopPanelCreateBody
        componentType={state.componentType}
        onSavedClose={onSavedClose}
        onCancel={onCancel}
      />
    </div>
  );
}
