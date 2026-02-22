/**
 * App.tsx - Main application component for Frontend Demo
 *
 * Dynamic routing based on faces configuration from the backend.
 * Each face has pages with route translations per language.
 * Only one face is active at a time — authenticated users can switch faces.
 * Public faces are shown to anonymous users, private faces to authenticated ones.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { ChatPage } from './pages/ChatPage';
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
 * Inner component that renders routes based on the selected face.
 * Must be inside FaceConfigProvider + AuthProvider.
 */
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { selectedFace, isLoading, error } = useFaceConfig();

  logger.info('AppRoutes render', {
    isAuthenticated,
    selectedFaceId: selectedFace?.id,
    selectedFaceIndex: selectedFace?.index,
  });

  // Static route translations
  const loginPaths = getRoutePaths('login');
  const registerPaths = getRoutePaths('register');
  const homepagePaths = getRoutePaths('homepage');
  const chatPaths = getRoutePaths('chat');

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
    <BrowserRouter>
      <div className="app-layout">
        <Header />
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

              {/* Chat — protected */}
              {chatPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
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
        <Footer />
      </div>
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
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <FaceConfigProvider>
          <AppRoutes />
        </FaceConfigProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
