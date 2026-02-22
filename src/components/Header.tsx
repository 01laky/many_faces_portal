import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MainLogo } from './MainLogo';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import {
  Home,
  List,
  FileText,
  FilePlus,
  FileEdit,
  FileBox,
  LogIn,
  UserPlus,
  MessageCircle,
  Info,
  Settings,
  UserCircle,
  Globe,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './Header.scss';

/** Map page name / path / type to a lucide icon */
function getPageIcon(pageName: string, pagePath: string, pageTypeIndex?: string): LucideIcon {
  const name = pageName.toLowerCase();
  const path = pagePath.toLowerCase();
  const typeIdx = (pageTypeIndex ?? '').toLowerCase();

  if (typeIdx === 'home') return Home;
  if (typeIdx === 'list') return List;
  if (typeIdx === 'detail') return FileText;
  if (typeIdx === 'edit') return FileEdit;
  if (typeIdx === 'create') return FilePlus;
  if (typeIdx === 'static') return FileBox;

  if (name.includes('home') || path.includes('home')) return Home;
  if (name.includes('list') || path.includes('list')) return List;
  if (name.includes('detail') || path.includes('detail')) return FileText;
  if (name.includes('chat') || path.includes('chat')) return MessageCircle;
  if (name.includes('login') || path.includes('login')) return LogIn;
  if (name.includes('register') || path.includes('register')) return UserPlus;
  if (name.includes('setting') || path.includes('setting')) return Settings;

  return FileBox;
}

export function Header() {
  const { t } = useTranslation('common');
  const getLocalizedPath = useLocalizedLink();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { availableFaces, selectedFace, selectFace, getFaceHomePath } = useFaceConfig();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate(getLocalizedPath('/login'), { replace: true });
      }, 100);
    } catch {
      setTimeout(() => {
        navigate(getLocalizedPath('/login'), { replace: true });
      }, 100);
    }
  };

  const handleFaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const faceId = parseInt(e.target.value, 10);
    selectFace(faceId);
    navigate(getLocalizedPath(getFaceHomePath()), { replace: true });
  };

  /** Check if a link path is currently active */
  const isActive = (linkPath: string) => {
    const resolved = getLocalizedPath(linkPath);
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  return (
    <header className="app-header" style={gradientVars}>
      <div className="header-border-top" />

      <div className="header-main">
        {/* Logo + brand */}
        <Link to={getLocalizedPath('')} className="header-brand">
          <MainLogo />
          <div className="header-brand-text">
            <span className="header-brand-title">The Many Faces</span>
            <span className="header-brand-subtitle">Demo</span>
          </div>
        </Link>

        {/* Navigation icons */}
        <nav className="header-nav">
          {!isAuthenticated ? (
            <>
              <Link
                to={getLocalizedPath('/login')}
                className={`header-icon-link ${isActive('/login') ? 'header-icon-link--active' : ''}`}
                title={t('pages.login.title')}
              >
                <LogIn size={22} />
              </Link>
              <Link
                to={getLocalizedPath('/register')}
                className={`header-icon-link ${isActive('/register') ? 'header-icon-link--active' : ''}`}
                title={t('pages.register.title')}
              >
                <UserPlus size={22} />
              </Link>
            </>
          ) : (
            <>
              <Link
                to={getLocalizedPath(getFaceHomePath())}
                className={`header-icon-link ${isActive(getFaceHomePath()) ? 'header-icon-link--active' : ''}`}
                title={t('pages.homepage.title')}
              >
                <Home size={22} />
              </Link>

              {/* Dynamic face page icons */}
              {selectedFace?.pages.map((page) => {
                const pagePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
                const linkPath = `/${selectedFace.index}/${pagePath}`;
                const Icon = getPageIcon(page.name, page.path, page.pageType?.index);
                return (
                  <Link
                    key={page.id}
                    to={getLocalizedPath(linkPath)}
                    className={`header-icon-link ${isActive(linkPath) ? 'header-icon-link--active' : ''}`}
                    title={page.name}
                  >
                    <Icon size={22} />
                  </Link>
                );
              })}

              <Link
                to={getLocalizedPath('/chat')}
                className={`header-icon-link ${isActive('/chat') ? 'header-icon-link--active' : ''}`}
                title={t('pages.chat.title')}
              >
                <MessageCircle size={22} />
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="header-right">
          {/* Face selector */}
          {isAuthenticated && availableFaces.length > 1 && (
            <select
              className="face-selector"
              value={selectedFace?.id ?? ''}
              onChange={handleFaceChange}
            >
              {availableFaces.map((face) => (
                <option key={face.id} value={face.id}>
                  {face.title}
                </option>
              ))}
            </select>
          )}

          {/* Utility icons */}
          <div className="header-utils">
            <button className="header-icon-btn" title="Info" type="button">
              <Info size={16} />
            </button>
            <button className="header-icon-btn" title="Settings" type="button">
              <Settings size={16} />
            </button>
            <LanguageSwitcher />
          </div>

          {/* User name + avatar */}
          {isAuthenticated && user ? (
            <button className="header-user-btn" onClick={handleLogout} title="Logout" type="button">
              <span className="header-user-role">{user.email?.split('@')[0] ?? 'User'}</span>
              <UserCircle size={36} strokeWidth={1.5} />
            </button>
          ) : (
            <div className="header-avatar-placeholder">
              <Globe size={22} />
            </div>
          )}
        </div>
      </div>

      <div className="header-border-bottom" />
    </header>
  );
}
