/**
 * ComponentBlock - Wrapper for every grid/carousel component with unified style.
 *
 * Header: + opens the global top sliding panel (create). List navigates to /list/:typeId.
 * Minor actions (sort / filter rank, block autoplay) use the small slide-out on this block.
 * Optional editAlbum/editBlog/editReel still opens the local panel for inline edit.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  List,
  Flag,
  HelpCircle,
  ArrowUpDown,
  Star,
  Settings,
  ChevronLeft,
  Play,
  Square,
  ChevronRight,
  X,
  Album,
  LayoutGrid,
  FileText,
  Megaphone,
  MessageCircle,
  User,
  Film,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../../hooks/useAnimatedGradient';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { useGridTopPanel } from '../../contexts/GridTopPanelContext';
import { COMPONENT_TYPE_ID } from '../../constants/componentTypeIds';
import { AlbumForm } from '../grid/AlbumForm';
import { BlogForm } from '../grid/BlogForm';
import { ReelForm } from '../grid/ReelForm';
import type { AlbumItem } from '../../api/services/AlbumsService';
import type { BlogItem } from '../../api/services/BlogsService';
import type { ReelItem } from '../../api/services/ReelsService';
import type { GridComponentType } from '../PageGridLayout';
import './ComponentBlock.scss';

const COMPONENT_DEFAULTS: Record<
  GridComponentType,
  { title: string; icon: LucideIcon; hasFooter: boolean }
> = {
  album: { title: 'Album', icon: Album, hasFooter: false },
  albumGrid: { title: 'Albums', icon: LayoutGrid, hasFooter: true },
  albumCarousel: { title: 'Albums', icon: LayoutGrid, hasFooter: true },
  ad: { title: 'Ad', icon: Megaphone, hasFooter: false },
  adGrid: { title: 'Ads', icon: LayoutGrid, hasFooter: true },
  adCarousel: { title: 'Ads', icon: LayoutGrid, hasFooter: true },
  blog: { title: 'Blog', icon: FileText, hasFooter: false },
  blogGrid: { title: 'Blog', icon: LayoutGrid, hasFooter: true },
  blogCarousel: { title: 'Blog', icon: LayoutGrid, hasFooter: true },
  chatRoom: { title: 'Chat', icon: MessageCircle, hasFooter: false },
  chatRoomGrid: { title: 'Chats', icon: LayoutGrid, hasFooter: true },
  chatRoomCarousel: { title: 'Chats', icon: LayoutGrid, hasFooter: true },
  userProfile: { title: 'Profile', icon: User, hasFooter: false },
  userProfileGrid: { title: 'Profiles', icon: LayoutGrid, hasFooter: true },
  userProfileCarousel: { title: 'Profiles', icon: LayoutGrid, hasFooter: true },
  reel: { title: 'Reel', icon: Film, hasFooter: false },
  reelGrid: { title: 'Reels', icon: LayoutGrid, hasFooter: true },
  reelCarousel: { title: 'Reels', icon: LayoutGrid, hasFooter: true },
  story: { title: 'Story', icon: BookOpen, hasFooter: false },
  storyGrid: { title: 'Stories', icon: LayoutGrid, hasFooter: true },
  storyCarousel: { title: 'Stories', icon: LayoutGrid, hasFooter: true },
};

const STORAGE_PREFIX = 'component-settings-';

function getStoredSettings(componentId: string): { autoplay?: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + componentId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredSettings(componentId: string, data: { autoplay?: boolean }) {
  try {
    localStorage.setItem(STORAGE_PREFIX + componentId, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const ALBUM_COMPONENT_TYPES: GridComponentType[] = ['album', 'albumGrid', 'albumCarousel'];
const BLOG_COMPONENT_TYPES: GridComponentType[] = ['blog', 'blogGrid', 'blogCarousel'];
const REEL_COMPONENT_TYPES: GridComponentType[] = ['reel', 'reelGrid', 'reelCarousel'];
const CHAT_ROOM_COMPONENT_TYPES: GridComponentType[] = [
  'chatRoom',
  'chatRoomGrid',
  'chatRoomCarousel',
];

export interface ComponentBlockProps {
  componentId: string;
  componentType: GridComponentType;
  title?: string | null;
  icon?: string | null;
  children: React.ReactNode;
  /** For grid/carousel: current page index (0-based) */
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onPlayPause?: (playing: boolean) => void;
  /** Initial playing from localStorage */
  autoplayFromStorage?: boolean;
  /** Album to edit (opens local panel) */
  editAlbum?: AlbumItem | null;
  onAlbumSaved?: (album: AlbumItem) => void;
  /** Blog to edit (opens local panel) */
  editBlog?: BlogItem | null;
  onBlogSaved?: (blog: BlogItem) => void;
  /** Reel to edit (opens local panel) */
  editReel?: ReelItem | null;
  onReelSaved?: (reel: ReelItem) => void;
}

export function ComponentBlock({
  componentId,
  componentType,
  title: titleProp,
  children,
  page = 0,
  totalPages = 1,
  onPrev,
  onNext,
  onPlayPause,
  autoplayFromStorage = false,
  editAlbum,
  onAlbumSaved,
  editBlog,
  onBlogSaved,
  editReel,
  onReelSaved,
}: ComponentBlockProps) {
  const { t } = useTranslation('common');
  const { selectedFace } = useFaceConfig();
  const { openGridCreate } = useGridTopPanel();
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);
  const defaults = COMPONENT_DEFAULTS[componentType];
  const TitleIcon = defaults.icon;
  const title = titleProp ?? defaults.title;
  const hasFooter = defaults.hasFooter;

  const isAlbumType = ALBUM_COMPONENT_TYPES.includes(componentType);
  const isBlogType = BLOG_COMPONENT_TYPES.includes(componentType);
  const isReelType = REEL_COMPONENT_TYPES.includes(componentType);
  const isChatRoomType = CHAT_ROOM_COMPONENT_TYPES.includes(componentType);
  const isFaceHost = selectedFace?.myFaceRoleName === 'FACE_HOST';
  const canCreateChatRoom = isChatRoomType && selectedFace?.chatRoomsCreate === true && !isFaceHost;
  const unsupportedCreateType =
    componentType === 'ad' ||
    componentType === 'adGrid' ||
    componentType === 'adCarousel' ||
    componentType === 'story' ||
    componentType === 'storyGrid' ||
    componentType === 'storyCarousel' ||
    componentType === 'userProfile' ||
    componentType === 'userProfileGrid' ||
    componentType === 'userProfileCarousel';
  const createDisabled = (isChatRoomType && !canCreateChatRoom) || unsupportedCreateType;
  const createTitle =
    isChatRoomType && !canCreateChatRoom
      ? isFaceHost
        ? t('gridBlocks.actions.hostCannotCreateChatRooms', 'Hosts cannot create chat rooms')
        : t(
            'gridBlocks.actions.chatRoomCreationDisabled',
            'Chat room creation is disabled for this face'
          )
      : unsupportedCreateType
        ? t('gridBlocks.actions.creationUnavailable', 'Creation is not available from this block')
        : t('gridBlocks.actions.createNew', 'Create new');

  type LocalPanelMode = 'edit' | 'sort' | 'block';
  const [localPanelOpen, setLocalPanelOpen] = useState(false);
  const [localPanelMode, setLocalPanelMode] = useState<LocalPanelMode>('sort');

  useEffect(() => {
    if (editAlbum && isAlbumType) {
      queueMicrotask(() => {
        setLocalPanelMode('edit');
        setLocalPanelOpen(true);
      });
    } else if (editBlog && isBlogType) {
      queueMicrotask(() => {
        setLocalPanelMode('edit');
        setLocalPanelOpen(true);
      });
    } else if (editReel && isReelType) {
      queueMicrotask(() => {
        setLocalPanelMode('edit');
        setLocalPanelOpen(true);
      });
    }
  }, [editAlbum, editBlog, editReel, isAlbumType, isBlogType, isReelType]);

  const [playing, setPlaying] = useState(autoplayFromStorage);
  const [settings, setSettings] = useState(() => getStoredSettings(componentId));

  const openLocalPanel = useCallback((mode: LocalPanelMode) => {
    setLocalPanelMode(mode);
    setLocalPanelOpen(true);
  }, []);

  const handleAlbumSaved = useCallback(
    (album: AlbumItem) => {
      setLocalPanelOpen(false);
      onAlbumSaved?.(album);
    },
    [onAlbumSaved]
  );

  const handleBlogSaved = useCallback(
    (blog: BlogItem) => {
      setLocalPanelOpen(false);
      onBlogSaved?.(blog);
    },
    [onBlogSaved]
  );

  const handleReelSaved = useCallback(
    (reel: ReelItem) => {
      setLocalPanelOpen(false);
      onReelSaved?.(reel);
    },
    [onReelSaved]
  );

  const closeLocalPanel = useCallback(() => setLocalPanelOpen(false), []);

  const handlePlayPause = useCallback(() => {
    const next = !playing;
    setPlaying(next);
    onPlayPause?.(next);
    setStoredSettings(componentId, { ...settings, autoplay: next });
    setSettings((s) => ({ ...s, autoplay: next }));
  }, [playing, onPlayPause, componentId, settings]);

  const onPlayPauseRef = useRef(onPlayPause);
  useEffect(() => {
    onPlayPauseRef.current = onPlayPause;
  }, [onPlayPause]);
  useEffect(() => {
    if (!hasFooter || !autoplayFromStorage) return;
    onPlayPauseRef.current?.(true);
    return () => {
      onPlayPauseRef.current?.(false);
    };
  }, [hasFooter, autoplayFromStorage]);

  const handleSettingsChange = useCallback(
    (key: 'autoplay', value: boolean) => {
      const next = { ...settings, [key]: value };
      setSettings(next);
      setStoredSettings(componentId, next);
      if (key === 'autoplay') setPlaying(value);
    },
    [componentId, settings]
  );

  return (
    <div className="component-block" style={gradientVars}>
      <div className="component-block-border-top" />
      <div className="component-block-main">
        {/* Header */}
        <div className="component-block-header">
          <div className="component-block-title-panel">
            <TitleIcon size={18} aria-hidden />
            <span className="component-block-title">{title}</span>
          </div>
          <div className="component-block-actions">
            <button
              type="button"
              className="component-block-action-btn"
              title={createTitle}
              disabled={createDisabled}
              onClick={() => {
                if (createDisabled) return;
                openGridCreate(componentType);
              }}
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t('gridBlocks.actions.listPage', 'List page')}
              onClick={() =>
                navigate(getLocalizedPath(`/list/${COMPONENT_TYPE_ID[componentType]}`))
              }
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t('gridBlocks.actions.reportUnavailable', 'Report is not available yet')}
              disabled
            >
              <Flag size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t('gridBlocks.actions.help', 'Help')}
            >
              <HelpCircle size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t('gridBlocks.actions.sortFilterRank', 'Sort & filter rank')}
              onClick={() => openLocalPanel('sort')}
            >
              <ArrowUpDown size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t(
                'gridBlocks.actions.favoritesUnavailable',
                'Favorites are not available yet'
              )}
              disabled
            >
              <Star size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title={t('gridBlocks.actions.blockSettings', 'Block settings')}
              onClick={() => openLocalPanel('block')}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="component-block-content">{children}</div>

        {/* Footer (grid/carousel only) */}
        {hasFooter && (
          <div className="component-block-footer">
            <button
              type="button"
              className="component-block-footer-btn"
              disabled={page <= 0}
              onClick={onPrev}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="component-block-footer-btn component-block-footer-play"
              onClick={handlePlayPause}
              aria-label={playing ? 'Stop' : 'Play'}
              title={playing ? 'Stop autoplay' : 'Play'}
            >
              {playing ? <Square size={16} /> : <Play size={16} />}
              <span>{playing ? 'Stop' : 'Play'}</span>
            </button>
            <button
              type="button"
              className="component-block-footer-btn"
              disabled={page >= totalPages - 1}
              onClick={onNext}
              aria-label="Next"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="component-block-border-bottom" />

      {/* Small slide-out: edit (when parent passes edit*) or sort / block settings */}
      <div
        className={`component-block-panel ${localPanelOpen ? 'component-block-panel--open' : ''}`}
        style={gradientVars}
        aria-hidden={!localPanelOpen}
      >
        <div className="component-block-panel-header">
          {localPanelMode === 'edit' && isAlbumType && (
            <span className="component-block-panel-tab component-block-panel-tab--active">
              {editAlbum ? 'Edit Album' : 'Album'}
            </span>
          )}
          {localPanelMode === 'edit' && isBlogType && (
            <span className="component-block-panel-tab component-block-panel-tab--active">
              {editBlog ? 'Edit Blog' : 'Blog'}
            </span>
          )}
          {localPanelMode === 'edit' && isReelType && (
            <span className="component-block-panel-tab component-block-panel-tab--active">
              {editReel ? 'Edit Reel' : 'Reel'}
            </span>
          )}
          {localPanelMode !== 'edit' && (
            <nav className="component-block-panel-tabs">
              <button
                type="button"
                className={`component-block-panel-tab ${localPanelMode === 'sort' ? 'component-block-panel-tab--active' : ''}`}
                onClick={() => setLocalPanelMode('sort')}
              >
                Sort / rank
              </button>
              <button
                type="button"
                className={`component-block-panel-tab ${localPanelMode === 'block' ? 'component-block-panel-tab--active' : ''}`}
                onClick={() => setLocalPanelMode('block')}
              >
                Block
              </button>
            </nav>
          )}
          <button
            type="button"
            className="component-block-panel-close"
            onClick={closeLocalPanel}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="component-block-panel-body">
          {localPanelMode === 'edit' && isAlbumType && (
            <AlbumForm
              editAlbum={editAlbum}
              onSaved={handleAlbumSaved}
              onCancel={closeLocalPanel}
            />
          )}
          {localPanelMode === 'edit' && isBlogType && (
            <BlogForm editBlog={editBlog} onSaved={handleBlogSaved} onCancel={closeLocalPanel} />
          )}
          {localPanelMode === 'edit' && isReelType && (
            <ReelForm editReel={editReel} onSaved={handleReelSaved} onCancel={closeLocalPanel} />
          )}
          {localPanelMode === 'sort' && (
            <div className="component-block-panel-section">
              <h3 className="component-block-panel-heading">Sort & filter rank</h3>
              <p className="component-block-panel-desc">
                Fine-grained ordering and filters for this block only. (Placeholder — connect to
                your ranking API when ready.)
              </p>
            </div>
          )}
          {localPanelMode === 'block' && (
            <div className="component-block-panel-section">
              <h3 className="component-block-panel-heading">Block settings</h3>
              <p className="component-block-panel-desc">
                Stored locally per component (ID: {componentId}).
              </p>
              {hasFooter ? (
                <label className="component-block-panel-label">
                  <input
                    type="checkbox"
                    checked={settings.autoplay ?? false}
                    onChange={(e) => handleSettingsChange('autoplay', e.target.checked)}
                  />
                  Autoplay
                </label>
              ) : (
                <p className="component-block-panel-desc">
                  No carousel options for this block type.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
