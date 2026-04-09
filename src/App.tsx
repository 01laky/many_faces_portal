/**
 * App.tsx - Main application component for Frontend Demo
 *
 * Dynamic routing based on faces configuration from the backend.
 * Each face has pages with route translations per language.
 * Only one face is active at a time — authenticated users can switch faces.
 * Public faces are shown to anonymous users, private faces to authenticated ones.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiContextProvider } from './contexts/ApiContext';
import { MessengerProvider } from './contexts/MessengerContext';
import { FaceConfigProvider, useFaceConfig } from './contexts/FaceConfigContext';
import { GridTopPanelProvider, type GridTopPanelState } from './contexts/GridTopPanelContext';
import { LanguageRouter } from './components/LanguageRouter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { FacePageView } from './components/FacePageView';
import { HomePage } from './pages/HomePage';
import { HomePageProtected } from './pages/HomePageProtected';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { ComponentListPage } from './pages/ComponentListPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ReelDetailPage } from './pages/ReelDetailPage';
import { FaceProfilesListPage } from './pages/FaceProfilesListPage';
import { FaceProfileDetailPage } from './pages/FaceProfileDetailPage';
import { StoriesListPage } from './pages/StoriesListPage';
import { StoriesCreateTopPanel } from './components/StoriesCreateTopPanel';
import { WallTicketCreateTopPanel } from './components/WallTicketCreateTopPanel';
import { pathnameMatchesWallPage } from './utils/faceWallPage';
import { useWallHostViewer } from './hooks/useWallHostViewer';
import {
  X,
  Globe,
  Check,
  Home,
  LogIn,
  UserPlus,
  UserRound,
  MessageCircle,
  Bell,
  Users,
  Shield,
  ShieldBan,
  UserCheck,
  IdCard,
  LayoutGrid,
  ArrowLeft,
} from 'lucide-react';
import { useLocalizedLink } from './hooks/useLocalizedLink';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { getPageIcon } from './utils/pageIcons';
import { useAnimatedGradientStyle, parseGradientSettings } from './hooks/useAnimatedGradient';
import { FriendRequestsTab } from './components/FriendRequestsTab';
import { MessengerTab } from './components/MessengerTab';
import { NotificationsTab } from './components/NotificationsTab';
import { BlockListTab } from './components/BlockListTab';
import { FollowTab } from './components/FollowTab';
import {
  FaceRoleSelectPanel,
  shouldShowFaceRolePanel,
  isFirstVisitToFace,
} from './components/FaceRoleSelectPanel';
import { EditProfileTab } from './components/EditProfileTab';
import { GridTopPanelContent } from './components/GridTopPanelContent';
import { gridTopPanelHeaderTitle } from './components/gridTopPanelCreateMeta';
import type { GridComponentType } from './components/PageGridLayout';
import { logger } from './utils/logger';
import { supportedLanguages } from './i18n/config';
import { getAllRouteTranslations } from './utils/routeTranslations';
import type { FaceConfig, PageConfig } from './api/types/facesConfig';
import i18n from './i18n/config';
import './styles/toast.scss';

/**
 * Helper: get all translated route paths for a static English route key
 */
const getRoutePaths = (englishRoute: string): string[] => {
  return getAllRouteTranslations(englishRoute, (key: string, options?: { lng?: string }) => {
    return i18n.t(key, { lng: options?.lng || 'en' });
  });
};

/**
 * Build all route paths for a page within a face.
 * Returns array of paths like: ["public/home", "public/domov"]
 * using routeTranslations from the page config.
 */
function buildFacePagePaths(face: FaceConfig, page: PageConfig): string[] {
  const basePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
  const paths: string[] = [`${face.index}/${basePath}`];

  // Add translated route paths for each language
  for (const rt of page.routeTranslations) {
    const translatedPath = rt.translatedRoute.startsWith('/')
      ? rt.translatedRoute.slice(1)
      : rt.translatedRoute;
    if (translatedPath && translatedPath !== basePath) {
      paths.push(`${face.index}/${translatedPath}`);
    }
  }

  return paths;
}

/** Redirects guest from /:lang to /:lang/:face/home so URL always has face prefix. */
function GuestRedirectToFaceHome() {
  const { lang } = useParams<{ lang: string }>();
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  if (!selectedFace) return <HomePage />;
  return <Navigate to={`/${lang}${getFaceHomePath()}`} replace />;
}

/**
 * Keeps URL :faceIndex in sync with FaceConfigContext (selectFace) for profile routes.
 */
function SyncFaceFromProfileRoutes({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedFace, availableFaces, selectFace, isLoading } = useFaceConfig();

  useEffect(() => {
    if (isLoading) return;
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length < 3) return;
    const lang = parts[0];
    const urlFaceIdx = parts[1];
    const rest = parts.slice(2).join('/');
    const faceMatch = availableFaces.find(
      (f) => f.index.toLowerCase() === urlFaceIdx.toLowerCase()
    );
    if (faceMatch) {
      if (selectedFace?.id !== faceMatch.id) selectFace(faceMatch.id);
      return;
    }
    if (selectedFace && rest) {
      navigate(`/${lang}/${selectedFace.index}/${rest}`, { replace: true });
    } else if (selectedFace) {
      navigate(`/${lang}/${selectedFace.index}/profiles`, { replace: true });
    }
  }, [location.pathname, availableFaces, selectedFace, selectFace, navigate, isLoading]);

  if (isLoading || !selectedFace) {
    return <div style={{ padding: 24 }}>{t('faceProfiles.loading')}</div>;
  }

  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length >= 3) {
    const urlFaceIdx = parts[1];
    if (urlFaceIdx.toLowerCase() !== selectedFace.index.toLowerCase()) {
      return <div style={{ padding: 24 }}>{t('faceProfiles.syncingFace')}</div>;
    }
  }

  return <>{children}</>;
}

/** Redirects guest from /:lang/login (or translated) to /:lang/:face/login so URL has face prefix. */
function GuestRedirectToFacePath({
  subPath,
  fallback,
}: {
  subPath: string;
  fallback: React.ReactNode;
}) {
  const { lang } = useParams<{ lang: string }>();
  const { selectedFace } = useFaceConfig();
  if (!selectedFace) return <>{fallback}</>;
  return <Navigate to={`/${lang}/${selectedFace.index}/${subPath}`} replace />;
}

/**
 * Navigation list rendered inside BrowserRouter so router hooks work.
 */
function PagesNav({ onNavigate }: { onNavigate: () => void }) {
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

/**
 * Inner component that renders routes based on the selected face.
 * Must be inside FaceConfigProvider + AuthProvider.
 */
function AppRoutes() {
  const { t } = useTranslation('common');
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { availableFaces, selectedFace, selectFace, isLoading, error, reload } = useFaceConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('settings');
  const [gridTopPanel, setGridTopPanel] = useState<GridTopPanelState>(null);
  const [storiesCreateOpen, setStoriesCreateOpen] = useState(false);
  const [wallCreateOpen, setWallCreateOpen] = useState(false);
  const [wallRefreshKey, setWallRefreshKey] = useState(0);
  const location = useLocation();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);
  const isWallPage = pathnameMatchesWallPage(location.pathname, selectedFace);
  const storiesHomePath = selectedFace ? getLocalizedPath(`/${selectedFace.index}/stories`) : '';
  const isStoriesPage =
    Boolean(selectedFace) &&
    (location.pathname === storiesHomePath || location.pathname.startsWith(storiesHomePath + '/'));

  const { canShowWallCreate } = useWallHostViewer({
    enabled: Boolean(isWallPage && isAuthenticated && token && selectedFace),
    token,
    faceId: selectedFace?.id,
  });

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setSettingsOpen(false);
        setGridTopPanel(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen]);

  // First visit to a private face: open top panel on Face role tab.
  // Wait for faces config to finish loading with auth — otherwise the first unauthenticated
  // fetch has no myFaceRole* fields and we would open the panel on every refresh.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) return;
    if (!selectedFace || selectedFace.isPublic) return;
    if (!isFirstVisitToFace(selectedFace)) return;
    const id = window.setTimeout(() => {
      setGridTopPanel(null);
      setSettingsOpen(true);
      setSettingsTab('faceRole');
    }, 0);
    return () => clearTimeout(id);
  }, [selectedFace, isLoading, isAuthenticated, token]);

  const closeGridPanel = useCallback(() => setGridTopPanel(null), []);

  const openGridCreate = useCallback((componentType: GridComponentType) => {
    setGridTopPanel({ mode: 'create', componentType });
    setSettingsOpen(true);
  }, []);

  const gridTopPanelApi = useMemo(
    () => ({
      gridTopPanel,
      openGridCreate,
      closeGridPanel,
    }),
    [gridTopPanel, openGridCreate, closeGridPanel]
  );

  const handleClosePanel = () => {
    setSettingsOpen(false);
    setGridTopPanel(null);
  };

  const handleGridCreateSavedClose = useCallback(() => {
    setSettingsOpen(false);
    setGridTopPanel(null);
  }, []);

  logger.info('AppRoutes render', {
    isAuthenticated,
    selectedFaceId: selectedFace?.id,
    selectedFaceIndex: selectedFace?.index,
  });

  // Static route translations
  const loginPaths = getRoutePaths('login');
  const registerPaths = getRoutePaths('register');
  const homepagePaths = getRoutePaths('homepage');

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading routes configuration...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '18px', color: 'red' }}>Failed to load routes configuration</div>
        <div style={{ fontSize: '14px', color: '#666' }}>{error.message}</div>
      </div>
    );
  }

  // Build face page routes for the selected face
  const faceRoutes: Array<{ key: string; path: string; isPublic: boolean; page: PageConfig }> = [];
  if (selectedFace) {
    for (const page of selectedFace.pages) {
      const paths = buildFacePagePaths(selectedFace, page);
      for (const path of paths) {
        faceRoutes.push({
          key: `${selectedFace.id}-${page.id}-${path}`,
          path,
          isPublic: selectedFace.isPublic,
          page,
        });
      }
    }
  }

  return (
    <GridTopPanelProvider value={gridTopPanelApi}>
      <div className={`app-layout ${settingsOpen ? 'app-layout--settings-open' : ''}`}>
        <Header
          onSettingsToggle={() => {
            setGridTopPanel(null);
            setSettingsTab('settings');
            setSettingsOpen((s) => !s);
          }}
          onMenuToggle={() => {
            setGridTopPanel(null);
            setSettingsTab('pages');
            setSettingsOpen((s) => !s);
          }}
          onProfileClick={() => {
            setGridTopPanel(null);
            setSettingsTab('profile');
            setSettingsOpen(true);
          }}
          onStoriesCreate={
            isAuthenticated && token && isStoriesPage ? () => setStoriesCreateOpen(true) : undefined
          }
          onWallTicketCreate={
            isAuthenticated && token && selectedFace && isWallPage && canShowWallCreate
              ? () => setWallCreateOpen(true)
              : undefined
          }
        />
        {isAuthenticated && token && (
          <StoriesCreateTopPanel
            open={storiesCreateOpen}
            onClose={() => setStoriesCreateOpen(false)}
            token={token}
          />
        )}
        {isAuthenticated && token && selectedFace && (
          <WallTicketCreateTopPanel
            open={wallCreateOpen}
            onClose={() => setWallCreateOpen(false)}
            token={token}
            faceId={selectedFace.id}
            onCreated={() => setWallRefreshKey((k) => k + 1)}
          />
        )}
        <div className="app-content-area">
          <div
            className={`settings-panel ${settingsOpen ? 'settings-panel--open' : ''}`}
            style={gradientVars}
          >
            <div
              className={`settings-panel-header ${gridTopPanel ? 'settings-panel-header--grid-tool' : ''}`}
            >
              {gridTopPanel ? (
                <>
                  <button
                    type="button"
                    className="grid-top-panel-back"
                    onClick={() => setGridTopPanel(null)}
                  >
                    <ArrowLeft size={18} aria-hidden />
                    {t('gridTopPanel.backToMenu', 'Back to menu')}
                  </button>
                  <h2 className="grid-top-panel-header-title">
                    {gridTopPanelHeaderTitle(gridTopPanel)}
                  </h2>
                  <button
                    className="settings-panel-close"
                    onClick={handleClosePanel}
                    type="button"
                    aria-label={t('settingsPanel.closePanel')}
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <nav className="settings-tabs">
                    <button
                      className={`settings-tab ${settingsTab === 'settings' ? 'settings-tab--active' : ''}`}
                      onClick={() => setSettingsTab('settings')}
                      type="button"
                    >
                      {t('settingsPanel.tabSettings')}
                    </button>
                    {isAuthenticated && (
                      <button
                        className={`settings-tab ${settingsTab === 'profile' ? 'settings-tab--active' : ''}`}
                        onClick={() => setSettingsTab('profile')}
                        type="button"
                      >
                        <UserRound size={16} />
                        <span>{t('editProfile.tabTitle', 'Edit profile')}</span>
                      </button>
                    )}
                    {isAuthenticated && selectedFace && shouldShowFaceRolePanel(selectedFace) && (
                      <button
                        className={`settings-tab ${settingsTab === 'faceRole' ? 'settings-tab--active' : ''}`}
                        onClick={() => setSettingsTab('faceRole')}
                        type="button"
                      >
                        <Shield size={16} />
                        <span>{t('faceRoleSelect.tabTitle', 'Face role')}</span>
                      </button>
                    )}
                    {isAuthenticated && (
                      <>
                        <button
                          className={`settings-tab ${settingsTab === 'friendRequests' ? 'settings-tab--active' : ''}`}
                          onClick={() => setSettingsTab('friendRequests')}
                          type="button"
                        >
                          <UserRound size={16} />
                          <span>{t('settingsPanel.tabFriendRequests')}</span>
                        </button>
                        <button
                          className={`settings-tab ${settingsTab === 'messenger' ? 'settings-tab--active' : ''}`}
                          onClick={() => setSettingsTab('messenger')}
                          type="button"
                        >
                          <MessageCircle size={16} />
                          <span>{t('settingsPanel.tabMessenger')}</span>
                        </button>
                        <button
                          className={`settings-tab ${settingsTab === 'notifications' ? 'settings-tab--active' : ''}`}
                          onClick={() => setSettingsTab('notifications')}
                          type="button"
                        >
                          <Bell size={16} />
                          <span>{t('settingsPanel.tabNotifications')}</span>
                        </button>
                        <button
                          className={`settings-tab ${settingsTab === 'blockList' ? 'settings-tab--active' : ''}`}
                          onClick={() => setSettingsTab('blockList')}
                          type="button"
                        >
                          <ShieldBan size={16} />
                          <span>{t('userBlock.blockList', 'Block List')}</span>
                        </button>
                        <button
                          className={`settings-tab ${settingsTab === 'follows' ? 'settings-tab--active' : ''}`}
                          onClick={() => setSettingsTab('follows')}
                          type="button"
                        >
                          <UserCheck size={16} />
                          <span>{t('userFollow.followList', 'Follows')}</span>
                        </button>
                      </>
                    )}
                    <button
                      className={`settings-tab ${settingsTab === 'faces' ? 'settings-tab--active' : ''}`}
                      onClick={() => setSettingsTab('faces')}
                      type="button"
                    >
                      {t('settingsPanel.tabFaces')}
                    </button>
                    <button
                      className={`settings-tab ${settingsTab === 'pages' ? 'settings-tab--active' : ''}`}
                      onClick={() => setSettingsTab('pages')}
                      type="button"
                    >
                      {t('settingsPanel.tabPages')}
                    </button>
                  </nav>
                  <button
                    className="settings-panel-close"
                    onClick={handleClosePanel}
                    type="button"
                    aria-label={t('settingsPanel.closePanel')}
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
            <div className="settings-panel-body">
              {gridTopPanel?.mode === 'create' ? (
                <GridTopPanelContent
                  state={gridTopPanel}
                  onSavedClose={handleGridCreateSavedClose}
                  onCancel={closeGridPanel}
                />
              ) : (
                <>
                  {settingsTab === 'profile' && <EditProfileTab />}
                  {settingsTab === 'faceRole' && token && selectedFace && (
                    <div className="settings-panel-body-fill settings-section">
                      <FaceRoleSelectPanel
                        face={selectedFace}
                        token={token}
                        onRoleSet={() => reload()}
                        inPanel
                      />
                    </div>
                  )}
                  {settingsTab === 'settings' && (
                    <div className="settings-section">
                      <label className="settings-label">
                        <Globe size={18} />
                        {t('settingsPanel.language')}
                      </label>
                      <LanguageSwitcher />
                      {isAuthenticated && (
                        <div className="settings-section" style={{ marginTop: 16 }}>
                          <button
                            type="button"
                            className="settings-logout-btn"
                            onClick={async () => {
                              setSettingsOpen(false);
                              await logout();
                              navigate(getLocalizedPath('/login'), { replace: true });
                            }}
                          >
                            {t('pages.logout.title', 'Logout')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {settingsTab === 'faces' && (
                    <div className="faces-grid">
                      {availableFaces.map((face) => {
                        const isSelected = selectedFace?.id === face.id;
                        const gradient = parseGradientSettings(face.gradientSettings);
                        const gradientBg = gradient
                          ? gradient.type === 'radial'
                            ? `radial-gradient(circle, ${gradient.colors.join(', ')})`
                            : `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`
                          : '#0d6efd';
                        return (
                          <button
                            key={face.id}
                            className={`face-card ${isSelected ? 'face-card--selected' : ''}`}
                            onClick={() => selectFace(face.id)}
                            type="button"
                          >
                            <div className="face-card-preview" style={{ background: gradientBg }} />
                            <div className="face-card-info">
                              <span className="face-card-title">{face.title}</span>
                              {face.description && (
                                <span className="face-card-desc">{face.description}</span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="face-card-check">
                                <Check size={16} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {settingsTab === 'pages' && (
                    <PagesNav onNavigate={() => setSettingsOpen(false)} />
                  )}
                  {settingsTab === 'friendRequests' && token && (
                    <div className="settings-panel-body-fill">
                      <FriendRequestsTab token={token} />
                    </div>
                  )}
                  {settingsTab === 'messenger' && token && <MessengerTab token={token} />}
                  {settingsTab === 'notifications' && token && <NotificationsTab token={token} />}
                  {settingsTab === 'blockList' && token && (
                    <div className="settings-panel-body-fill">
                      <BlockListTab token={token} />
                    </div>
                  )}
                  {settingsTab === 'follows' && token && (
                    <div className="settings-panel-body-fill">
                      <FollowTab token={token} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

              <Route path="/:lang" element={<LanguageRouter />}>
                {/* Index — guest redirects to /:lang/:face/home so URL has face prefix */}
                <Route
                  index
                  element={
                    <GuestRoute>
                      <GuestRedirectToFaceHome />
                    </GuestRoute>
                  }
                />

                {/* === Face page routes (dynamic, from selected face) === */}
                {faceRoutes.map((fr) => {
                  const pathNorm = fr.page.path.replace(/^\//, '');
                  const isPublicLogin = fr.isPublic && pathNorm === 'login';
                  const isPublicRegister = fr.isPublic && pathNorm === 'register';
                  const isPublicHome =
                    fr.isPublic && pathNorm === 'home' && fr.page.pageType?.index === 'home';
                  const publicElement = isPublicLogin ? (
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  ) : isPublicRegister ? (
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  ) : isPublicHome ? (
                    <GuestRoute>
                      <HomePage />
                    </GuestRoute>
                  ) : null;
                  return fr.isPublic ? (
                    // Public face routes — use real Login/Register/Home components when path matches
                    <Route
                      key={fr.key}
                      path={fr.path}
                      element={
                        publicElement ?? (
                          <FacePageView page={fr.page} wallRefreshKey={wallRefreshKey} />
                        )
                      }
                    />
                  ) : (
                    // Private face routes — require authentication
                    <Route
                      key={fr.key}
                      path={fr.path}
                      element={
                        <ProtectedRoute>
                          <FacePageView page={fr.page} wallRefreshKey={wallRefreshKey} />
                        </ProtectedRoute>
                      }
                    />
                  );
                })}

                {/* === Static routes === */}

                {/* Login — guest redirects to /:lang/:face/login so URL has face prefix */}
                {loginPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <GuestRoute>
                        <GuestRedirectToFacePath subPath={path} fallback={<LoginPage />} />
                      </GuestRoute>
                    }
                  />
                ))}

                {/* Register — guest redirects to /:lang/:face/register so URL has face prefix */}
                {registerPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <GuestRoute>
                        <GuestRedirectToFacePath subPath={path} fallback={<RegisterPage />} />
                      </GuestRoute>
                    }
                  />
                ))}

                {/* Homepage — protected */}
                {homepagePaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute>
                        <HomePageProtected />
                      </ProtectedRoute>
                    }
                  />
                ))}

                {/* Profile — protected */}
                {getRoutePaths('profile').map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                ))}

                {/* Component list — full-page paginated grid */}
                <Route
                  path="list/:componentTypeId"
                  element={
                    <ProtectedRoute>
                      <ComponentListPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="detail/:componentTypeId/:entityId"
                  element={
                    <ProtectedRoute>
                      <ComponentDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Album detail — protected */}
                <Route
                  path="album/:id"
                  element={
                    <ProtectedRoute>
                      <AlbumDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Blog detail — protected */}
                <Route
                  path="blog/:id"
                  element={
                    <ProtectedRoute>
                      <BlogDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Reel detail — protected */}
                <Route
                  path="reel/:id"
                  element={
                    <ProtectedRoute>
                      <ReelDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Face profile directory + detail — protected, URL includes face index */}
                <Route
                  path=":faceIndex/profiles"
                  element={
                    <ProtectedRoute>
                      <SyncFaceFromProfileRoutes>
                        <FaceProfilesListPage />
                      </SyncFaceFromProfileRoutes>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":faceIndex/profile/:userId"
                  element={
                    <ProtectedRoute>
                      <SyncFaceFromProfileRoutes>
                        <FaceProfileDetailPage />
                      </SyncFaceFromProfileRoutes>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path=":faceIndex/stories"
                  element={
                    <ProtectedRoute>
                      <SyncFaceFromProfileRoutes>
                        <StoriesListPage />
                      </SyncFaceFromProfileRoutes>
                    </ProtectedRoute>
                  }
                />

                {/* User detail — protected (more specific, must be before users list) */}
                {getRoutePaths('users').map((path) => (
                  <Route
                    key={`${path}-detail`}
                    path={`${path}/:id`}
                    element={
                      <ProtectedRoute>{token && <UserDetailPage token={token} />}</ProtectedRoute>
                    }
                  />
                ))}

                {/* Users list — protected */}
                {getRoutePaths('users').map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute>{token && <UsersPage token={token} />}</ProtectedRoute>
                    }
                  />
                ))}

                {/* Catch-all within language */}
                <Route path="*" element={<Navigate to=".." replace />} />
              </Route>

              {/* Global catch-all */}
              <Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
            </Routes>
          </main>
        </div>
        <Footer
          onMessagesClick={
            isAuthenticated
              ? () => {
                  setGridTopPanel(null);
                  setSettingsTab('messenger');
                  setSettingsOpen(true);
                }
              : undefined
          }
        />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </GridTopPanelProvider>
  );
}

function MessengerProviderWithToken({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return <MessengerProvider token={token}>{children}</MessengerProvider>;
}

function ApiContextProviderWithToken({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return <ApiContextProvider accessToken={token}>{children}</ApiContextProvider>;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <ApiContextProviderWithToken>
            <MessengerProviderWithToken>
              <FaceConfigProvider>
                <AppRoutes />
              </FaceConfigProvider>
            </MessengerProviderWithToken>
          </ApiContextProviderWithToken>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
