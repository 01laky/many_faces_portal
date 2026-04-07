/**
 * ComponentBlock - Wrapper for every grid/carousel component with unified style.
 *
 * Header: left = icon + title (from admin), right = action icons
 * (Create, List, Report, Help, Sort, Favorites, Settings).
 * Footer: Previous, Play/Stop, Next (for grid/carousel types).
 * Slide-out panel: Create form (by type) + Component settings (localStorage by componentId).
 */

import { useState, useCallback } from 'react';
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
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../constants/componentTypeIds';
import { AlbumForm } from './grid/AlbumForm';
import { BlogForm } from './grid/BlogForm';
import type { AlbumItem } from '../api/services/AlbumsService';
import type { BlogItem } from '../api/services/BlogsService';
import type { GridComponentType } from './PageGridLayout';
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
  /** Album to edit (opens panel in edit mode) */
  editAlbum?: AlbumItem | null;
  onAlbumSaved?: (album: AlbumItem) => void;
  /** Blog to edit (opens panel in edit mode) */
  editBlog?: BlogItem | null;
  onBlogSaved?: (blog: BlogItem) => void;
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
}: ComponentBlockProps) {
  const { selectedFace } = useFaceConfig();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const defaults = COMPONENT_DEFAULTS[componentType];
  const TitleIcon = defaults.icon;
  const title = titleProp ?? defaults.title;
  const hasFooter = defaults.hasFooter;

  const isAlbumType = ALBUM_COMPONENT_TYPES.includes(componentType);
  const isBlogType = BLOG_COMPONENT_TYPES.includes(componentType);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<'create' | 'settings'>('create');
  const [playing, setPlaying] = useState(autoplayFromStorage);
  const [settings, setSettings] = useState(() => getStoredSettings(componentId));

  const openPanel = useCallback((tab: 'create' | 'settings') => {
    setPanelTab(tab);
    setPanelOpen(true);
  }, []);

  const handleAlbumSaved = useCallback(
    (album: AlbumItem) => {
      setPanelOpen(false);
      onAlbumSaved?.(album);
    },
    [onAlbumSaved]
  );

  const handleBlogSaved = useCallback(
    (blog: BlogItem) => {
      setPanelOpen(false);
      onBlogSaved?.(blog);
    },
    [onBlogSaved]
  );

  const closePanel = useCallback(() => setPanelOpen(false), []);

  const handlePlayPause = useCallback(() => {
    const next = !playing;
    setPlaying(next);
    onPlayPause?.(next);
    setStoredSettings(componentId, { ...settings, autoplay: next });
    setSettings((s) => ({ ...s, autoplay: next }));
  }, [playing, onPlayPause, componentId, settings]);

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
              title="Create new"
              onClick={() => openPanel('create')}
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title="List page"
              onClick={() =>
                navigate(getLocalizedPath(`/list/${COMPONENT_TYPE_ID[componentType]}`))
              }
            >
              <List size={16} />
            </button>
            <button type="button" className="component-block-action-btn" title="Report">
              <Flag size={16} />
            </button>
            <button type="button" className="component-block-action-btn" title="Help">
              <HelpCircle size={16} />
            </button>
            <button type="button" className="component-block-action-btn" title="Sort">
              <ArrowUpDown size={16} />
            </button>
            <button type="button" className="component-block-action-btn" title="Add to favorites">
              <Star size={16} />
            </button>
            <button
              type="button"
              className="component-block-action-btn"
              title="Settings"
              onClick={() => openPanel('settings')}
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

      {/* Slide-out panel (create / settings) */}
      <div
        className={`component-block-panel ${panelOpen ? 'component-block-panel--open' : ''}`}
        style={gradientVars}
        aria-hidden={!panelOpen}
      >
        <div className="component-block-panel-header">
          {!isAlbumType && !isBlogType && (
            <nav className="component-block-panel-tabs">
              <button
                type="button"
                className={`component-block-panel-tab ${panelTab === 'create' ? 'component-block-panel-tab--active' : ''}`}
                onClick={() => setPanelTab('create')}
              >
                Create new
              </button>
              <button
                type="button"
                className={`component-block-panel-tab ${panelTab === 'settings' ? 'component-block-panel-tab--active' : ''}`}
                onClick={() => setPanelTab('settings')}
              >
                Settings
              </button>
            </nav>
          )}
          {isAlbumType && (
            <span className="component-block-panel-tab component-block-panel-tab--active">
              {editAlbum ? 'Edit Album' : 'Create Album'}
            </span>
          )}
          {isBlogType && (
            <span className="component-block-panel-tab component-block-panel-tab--active">
              {editBlog ? 'Edit Blog' : 'Create Blog'}
            </span>
          )}
          <button
            type="button"
            className="component-block-panel-close"
            onClick={closePanel}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="component-block-panel-body">
          {isAlbumType && (
            <AlbumForm editAlbum={editAlbum} onSaved={handleAlbumSaved} onCancel={closePanel} />
          )}
          {isBlogType && (
            <BlogForm editBlog={editBlog} onSaved={handleBlogSaved} onCancel={closePanel} />
          )}
          {!isAlbumType && !isBlogType && panelTab === 'create' && (
            <div className="component-block-panel-section">
              <h3 className="component-block-panel-heading">Create new {defaults.title}</h3>
              <p className="component-block-panel-desc">
                Form for creating new content (configured per component type).
              </p>
              <input
                type="text"
                className="component-block-panel-input"
                placeholder="Title"
                aria-label="Title"
              />
            </div>
          )}
          {!isAlbumType && !isBlogType && panelTab === 'settings' && (
            <div className="component-block-panel-section">
              <h3 className="component-block-panel-heading">Component settings</h3>
              <p className="component-block-panel-desc">
                Stored locally per component (ID: {componentId}).
              </p>
              <label className="component-block-panel-label">
                <input
                  type="checkbox"
                  checked={settings.autoplay ?? false}
                  onChange={(e) => handleSettingsChange('autoplay', e.target.checked)}
                />
                Autoplay
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
