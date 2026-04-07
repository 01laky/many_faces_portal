/**
 * App.tsx - Main application component for Frontend Demo
 *
 * Dynamic routing based on faces configuration from the backend.
 * Each face has pages with route translations per language.
 * Only one face is active at a time — authenticated users can switch faces.
 * Public faces are shown to anonymous users, private faces to authenticated ones.
 */

import { useState, useEffect } from 'react';
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
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
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
  FACE_VISITED_KEY,
} from './components/FaceRoleSelectPanel';
import { EditProfileTab } from './components/EditProfileTab';
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
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  // First visit to a private face: open slide-out panel with Face role tab by default (deferred to avoid setState-in-effect lint)
  useEffect(() => {
    if (!selectedFace || selectedFace.isPublic) return;
    if (!isFirstVisitToFace(selectedFace)) return;
    const id = window.setTimeout(() => {
      setSettingsOpen(true);
      setSettingsTab('faceRole');
    }, 0);
    return () => clearTimeout(id);
  }, [selectedFace?.id, selectedFace]);

  const handleClosePanel = () => {
    if (selectedFace && !selectedFace.isPublic) {
      localStorage.setItem(FACE_VISITED_KEY(selectedFace.id), '1');
    }
    setSettingsOpen(false);
  };

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
    <div className={`app-layout ${settingsOpen ? 'app-layout--settings-open' : ''}`}>
      <Header
        onSettingsToggle={() => {
          setSettingsTab('settings');
          setSettingsOpen((s) => !s);
        }}
        onMenuToggle={() => {
          setSettingsTab('pages');
          setSettingsOpen((s) => !s);
        }}
        onProfileClick={() => {
          setSettingsTab('profile');
          setSettingsOpen(true);
        }}
      />
      <div className="app-content-area">
        <div
          className={`settings-panel ${settingsOpen ? 'settings-panel--open' : ''}`}
          style={gradientVars}
        >
          <div className="settings-panel-header">
            <nav className="settings-tabs">
              <button
                className={`settings-tab ${settingsTab === 'settings' ? 'settings-tab--active' : ''}`}
                onClick={() => setSettingsTab('settings')}
                type="button"
              >
                Settings
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
                    <span>Friend Requests</span>
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === 'messenger' ? 'settings-tab--active' : ''}`}
                    onClick={() => setSettingsTab('messenger')}
                    type="button"
                  >
                    <MessageCircle size={16} />
                    <span>Messenger</span>
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === 'notifications' ? 'settings-tab--active' : ''}`}
                    onClick={() => setSettingsTab('notifications')}
                    type="button"
                  >
                    <Bell size={16} />
                    <span>Notifications</span>
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
                Faces
              </button>
              <button
                className={`settings-tab ${settingsTab === 'pages' ? 'settings-tab--active' : ''}`}
                onClick={() => setSettingsTab('pages')}
                type="button"
              >
                Pages
              </button>
            </nav>
            <button
              className="settings-panel-close"
              onClick={handleClosePanel}
              type="button"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>
          <div className="settings-panel-body">
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
                  Language
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
                    : face.color || '#0d6efd';
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
            {settingsTab === 'pages' && <PagesNav onNavigate={() => setSettingsOpen(false)} />}
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
                    element={publicElement ?? <FacePageView page={fr.page} />}
                  />
                ) : (
                  // Private face routes — require authentication
                  <Route
                    key={fr.key}
                    path={fr.path}
                    element={
                      <ProtectedRoute>
                        <FacePageView page={fr.page} />
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
                  element={<ProtectedRoute>{token && <UsersPage token={token} />}</ProtectedRoute>}
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
