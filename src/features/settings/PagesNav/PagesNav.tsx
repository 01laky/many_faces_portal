import { Link, useLocation } from 'react-router-dom';
import { Home, LogIn, UserPlus, Users, IdCard, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useTranslation } from 'react-i18next';
import { getPageIcon } from '../../../utils/pageIcons';

export function PagesNav({ onNavigate }: { onNavigate: () => void }) {
  const { isAuthenticated } = useAuth();
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const location = useLocation();
  const { t } = useTranslation('common');

  const isActive = (linkPath: string) => {
    const resolved = getLocalizedPath(linkPath);
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  if (!isAuthenticated) {
    return (
      <div className="pages-nav">
        <Link
          to={getLocalizedPath('/login')}
          className={`pages-nav-item ${isActive('/login') ? 'pages-nav-item--active' : ''}`}
          onClick={onNavigate}
        >
          <LogIn size={20} />
          <span>{t('pages.login.title')}</span>
        </Link>
        <Link
          to={getLocalizedPath('/register')}
          className={`pages-nav-item ${isActive('/register') ? 'pages-nav-item--active' : ''}`}
          onClick={onNavigate}
        >
          <UserPlus size={20} />
          <span>{t('pages.register.title')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pages-nav">
      <Link
        to={getLocalizedPath(getFaceHomePath())}
        className={`pages-nav-item ${isActive(getFaceHomePath()) ? 'pages-nav-item--active' : ''}`}
        onClick={onNavigate}
      >
        <Home size={20} />
        <span>{t('pages.homepage.title')}</span>
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
              className={`pages-nav-item ${isActive(linkPath) ? 'pages-nav-item--active' : ''}`}
              onClick={onNavigate}
            >
              <Icon size={20} />
              <span>{page.name}</span>
            </Link>
          );
        })}
      <Link
        to={getLocalizedPath('/users')}
        className={`pages-nav-item ${isActive('/users') ? 'pages-nav-item--active' : ''}`}
        onClick={onNavigate}
      >
        <Users size={20} />
        <span>{t('pages.users.title')}</span>
      </Link>
      {selectedFace && (
        <Link
          to={getLocalizedPath(`/${selectedFace.index}/profiles`)}
          className={`pages-nav-item ${isActive(`/${selectedFace.index}/profiles`) ? 'pages-nav-item--active' : ''}`}
          onClick={onNavigate}
        >
          <IdCard size={20} />
          <span>{t('faceProfiles.headerTitle')}</span>
        </Link>
      )}
      {selectedFace && (
        <Link
          to={getLocalizedPath(`/${selectedFace.index}/stories`)}
          className={`pages-nav-item ${isActive(`/${selectedFace.index}/stories`) ? 'pages-nav-item--active' : ''}`}
          onClick={onNavigate}
        >
          <LayoutGrid size={20} />
          <span>{t('stories.navLabel')}</span>
        </Link>
      )}
    </div>
  );
}
