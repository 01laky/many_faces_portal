/**
 * App.tsx - Main application component for Frontend Demo
 *
 * Dynamic routing based on faces configuration from the backend.
 * Each face has pages with route translations per language.
 * Only one face is active at a time — authenticated users can switch faces.
 * Public faces are shown to anonymous users, private faces to authenticated ones.
 */

import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
} from 'lucide-react';
import { useLocalizedLink } from './hooks/useLocalizedLink';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { getPageIcon } from './utils/pageIcons';
import { useAnimatedGradientStyle, parseGradientSettings } from './hooks/useAnimatedGradient';
import { FriendRequestsTab } from './components/FriendRequestsTab';
import { MessengerTab } from './components/MessengerTab';
import { NotificationsTab } from './components/NotificationsTab';
import { FaceRoleSelectPanel, shouldShowFaceRolePanel } from './components/FaceRoleSelectPanel';
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
      />
      {isAuthenticated && token && selectedFace && shouldShowFaceRolePanel(selectedFace) && (
        <FaceRoleSelectPanel face={selectedFace} token={token} onRoleSet={() => reload()} />
      )}
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
              onClick={() => setSettingsOpen(false)}
              type="button"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>
          <div className="settings-panel-body">
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
          </div>
        </div>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

            <Route path="/:lang" element={<LanguageRouter />}>
              {/* Index — guest landing or redirect to homepage */}
              <Route
                index
                element={
                  <GuestRoute>
                    <HomePage />
                  </GuestRoute>
                }
              />

              {/* === Face page routes (dynamic, from selected face) === */}
              {faceRoutes.map((fr) =>
                fr.isPublic ? (
                  // Public face routes — visible without auth
                  <Route key={fr.key} path={fr.path} element={<FacePageView page={fr.page} />} />
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
                )
              )}

              {/* === Static routes === */}

              {/* Login — guest only */}
              {loginPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
              ))}

              {/* Register — guest only */}
              {registerPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <GuestRoute>
                      <RegisterPage />
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

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <MessengerProviderWithToken>
            <FaceConfigProvider>
              <AppRoutes />
            </FaceConfigProvider>
          </MessengerProviderWithToken>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
