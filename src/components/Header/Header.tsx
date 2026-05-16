import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useProfile } from '../../hooks/api/useProfileApi';
import { useAnimatedGradientStyle } from '../../hooks/useAnimatedGradient';
import { MainLogo } from '../MainLogo';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  Home,
  LogIn,
  UserPlus,
  Info,
  Settings,
  UserCircle,
  Menu,
  Users,
  IdCard,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { getPageIcon } from '../../utils/pageIcons';
import { pathnameMatchesWallPage } from '../../utils/faceWallPage';
import type { FaceConfig } from '../../api/types/facesConfig';
import './Header.scss';

interface HeaderProps {
  onSettingsToggle?: () => void;
  onMenuToggle?: () => void;
  /** When provided, clicking the profile area opens the slide-out panel with Edit profile tab selected */
  onProfileClick?: () => void;
  /** Open top panel to create a new story */
  onStoriesCreate?: () => void;
  /** Open top panel to create a wall ticket (face wall page) */
  onWallTicketCreate?: () => void;
}

/** Resolve current face page name from pathname and face config */
function getCurrentPageName(pathname: string, selectedFace: FaceConfig | null): string | null {
  if (!selectedFace) return null;
  const segments = pathname.split('/').filter(Boolean);
  const faceIndex = selectedFace.index.toLowerCase();
  const faceIdx = segments.findIndex((s) => s.toLowerCase() === faceIndex);
  if (faceIdx < 0) return null;
  const afterFace = segments.slice(faceIdx + 1);
  const pathSuffix = '/' + afterFace.join('/');
  const page = selectedFace.pages.find((p) => {
    const pPath = p.path.startsWith('/') ? p.path : '/' + p.path;
    return pathSuffix === pPath || pathSuffix.startsWith(pPath + '/');
  });
  return page?.name ?? null;
}

export function Header({
  onSettingsToggle,
  onMenuToggle,
  onProfileClick,
  onStoriesCreate,
  onWallTicketCreate,
}: HeaderProps) {
  const { t } = useTranslation('common');
  const getLocalizedPath = useLocalizedLink();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  const { profile, resolvedAvatarUrl } = useProfile();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  const displayName =
    profile?.firstName?.trim() || profile?.lastName?.trim()
      ? [profile?.firstName?.trim(), profile?.lastName?.trim()].filter(Boolean).join(' ')
      : (user?.email?.split('@')[0] ?? 'User');

  const isActive = (linkPath: string) => {
    const resolved = getLocalizedPath(linkPath);
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  const currentPageName = getCurrentPageName(location.pathname, selectedFace);
  const faceIndexDisplay = selectedFace?.index ?? '—';
  const isWallPage = pathnameMatchesWallPage(location.pathname, selectedFace);

  return (
    <header className="app-header" style={gradientVars}>
      <div className="header-border-top" />

      <div className="header-main">
        {/* Left: logo panel (rounded) */}
        <div className="header-panel header-panel--brand">
          <Link to={getLocalizedPath('')} className="header-brand">
            <MainLogo />
            <div className="header-brand-text">
              <span className="header-brand-title">The Many Faces</span>
              <span className="header-brand-subtitle">Demo</span>
            </div>
          </Link>
        </div>

        {/* Center: pages row + breadcrumb row */}
        <div className="header-center">
          {/* Top: page nav icons */}
          <nav className="header-pages-row">
            {!isAuthenticated ? (
              <>
                <Link
                  to={getLocalizedPath('/login')}
                  className={`header-page-icon ${isActive('/login') ? 'header-page-icon--active' : ''}`}
                  title={t('pages.login.title')}
                >
                  <LogIn size={20} />
                </Link>
                <Link
                  to={getLocalizedPath('/register')}
                  className={`header-page-icon ${isActive('/register') ? 'header-page-icon--active' : ''}`}
                  title={t('pages.register.title')}
                >
                  <UserPlus size={20} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getLocalizedPath(getFaceHomePath())}
                  className={`header-page-icon ${isActive(getFaceHomePath()) ? 'header-page-icon--active' : ''}`}
                  title={t('pages.homepage.title')}
                >
                  <Home size={20} />
                </Link>
                {selectedFace?.pages
                  .filter((p) => p.pageType?.index !== 'home')
                  .map((page) => {
                    const pagePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
                    const linkPath = `/${selectedFace.index}/${pagePath}`;
                    const Icon = getPageIcon(page.name, page.path, page.pageType?.index);
                    return (
                      <Link
                        key={page.id}
                        to={getLocalizedPath(linkPath)}
                        className={`header-page-icon ${isActive(linkPath) ? 'header-page-icon--active' : ''}`}
                        title={page.name}
                      >
                        <Icon size={20} />
                      </Link>
                    );
                  })}
                <Link
                  to={getLocalizedPath('/users')}
                  className={`header-page-icon ${isActive('/users') ? 'header-page-icon--active' : ''}`}
                  title={t('pages.users.title')}
                >
                  <Users size={20} />
                </Link>
                {selectedFace && (
                  <Link
                    to={getLocalizedPath(`/${selectedFace.index}/profiles`)}
                    className={`header-page-icon ${isActive(`/${selectedFace.index}/profiles`) ? 'header-page-icon--active' : ''}`}
                    title={t('faceProfiles.headerTitle')}
                  >
                    <IdCard size={20} />
                  </Link>
                )}
                {selectedFace && (
                  <Link
                    to={getLocalizedPath(`/${selectedFace.index}/stories`)}
                    className={`header-page-icon ${isActive(`/${selectedFace.index}/stories`) ? 'header-page-icon--active' : ''}`}
                    title={t('stories.headerListTitle')}
                  >
                    <LayoutGrid size={20} />
                  </Link>
                )}
                {selectedFace && onStoriesCreate && (
                  <button
                    type="button"
                    className="header-page-icon"
                    title={t('stories.headerCreateTitle')}
                    onClick={onStoriesCreate}
                  >
                    <Plus size={20} />
                  </button>
                )}
                {selectedFace && onWallTicketCreate && isWallPage && (
                  <button
                    type="button"
                    className="header-page-icon"
                    title={t('wallTickets.headerCreateTitle')}
                    onClick={onWallTicketCreate}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Bottom: breadcrumb + action icons */}
          <div className="header-bottom-row">
            <div className="header-breadcrumb">
              <span className="header-breadcrumb-chip">/ {faceIndexDisplay}</span>
              <span className="header-breadcrumb-sep">/</span>
              <span className="header-breadcrumb-chip">
                {currentPageName ?? t('pages.homepage.title')}
              </span>
            </div>
            <div className="header-actions">
              <button className="header-action-btn" type="button" title={t('header.info')}>
                <Info size={16} />
              </button>
              <button
                className="header-action-btn"
                type="button"
                title={t('header.settings')}
                onClick={onSettingsToggle}
              >
                <Settings size={16} />
              </button>
              <button
                className="header-action-btn"
                type="button"
                title={t('header.menu')}
                onClick={onMenuToggle}
              >
                <Menu size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: profile panel (rounded) */}
        <div className="header-panel header-panel--profile">
          {isAuthenticated && user ? (
            onProfileClick ? (
              <button
                type="button"
                className="header-profile header-profile-btn"
                title={t('pages.profile.title')}
                onClick={onProfileClick}
              >
                <div className="header-profile-info">
                  <span className="header-profile-name">{displayName}</span>
                  <span className="header-profile-status">Online</span>
                </div>
                <div className="header-profile-avatar">
                  {resolvedAvatarUrl ? (
                    <img src={resolvedAvatarUrl} alt="" className="header-profile-avatar-img" />
                  ) : (
                    <UserCircle size={40} strokeWidth={1.5} />
                  )}
                </div>
              </button>
            ) : (
              <Link
                to={getLocalizedPath('/profile')}
                className={`header-profile ${isActive('/profile') ? 'header-profile--active' : ''}`}
                title={t('pages.profile.title')}
              >
                <div className="header-profile-info">
                  <span className="header-profile-name">{displayName}</span>
                  <span className="header-profile-status">Online</span>
                </div>
                <div className="header-profile-avatar">
                  {resolvedAvatarUrl ? (
                    <img src={resolvedAvatarUrl} alt="" className="header-profile-avatar-img" />
                  ) : (
                    <UserCircle size={40} strokeWidth={1.5} />
                  )}
                </div>
              </Link>
            )
          ) : (
            <div className="header-profile header-profile--guest">
              <div className="header-profile-info">
                <span className="header-profile-status">{t('header.guest')}</span>
              </div>
              <div className="header-profile-avatar">
                <UserCircle size={32} strokeWidth={1.6} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile: burger (replaces center on small screens) */}
        <button
          className="header-burger"
          type="button"
          title={t('header.menu')}
          onClick={onMenuToggle}
          aria-label={t('header.menu')}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="header-border-bottom" />
    </header>
  );
}
