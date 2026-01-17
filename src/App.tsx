/**
 * App.tsx - Main application component for Frontend Demo
 * 
 * This component sets up the React Router routing structure with multi-language support.
 * It handles:
 * - Language-based routing (e.g., /en/login, /sk/prihlasenie, /cz/prihlaseni)
 * - Protected routes (require authentication)
 * - Guest-only routes (redirect if authenticated)
 * - Route translations for i18n support
 * 
 * Routing structure:
 * - Root (/) redirects to default language
 * - /:lang routes handle language-specific paths
 * - Each route can have multiple translations (login, prihlasenie, prihlaseni)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageRouter } from './components/LanguageRouter';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { HomePage } from './pages/HomePage';
import { HomePageProtected } from './pages/HomePageProtected';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { logger } from './utils/logger';
import { supportedLanguages } from './i18n/config';
import { getAllRouteTranslations } from './utils/routeTranslations';
import i18n from './i18n/config';
import './styles/toast.scss';

/**
 * Helper function to get all translated route paths for a given English route
 * 
 * This function retrieves all possible translations of a route name across all supported languages.
 * For example, 'login' returns ['login', 'prihlasenie', 'prihlaseni'] for en, sk, cz.
 * 
 * @param englishRoute - The English route name (e.g., 'login', 'register', 'homepage')
 * @returns Array of all translated route paths
 */
const getRoutePaths = (englishRoute: string): string[] => {
  return getAllRouteTranslations(englishRoute, (key: string, options?: { lng?: string }) => {
    return i18n.t(key, { lng: options?.lng || 'en' });
  });
};

/**
 * Main App component
 * 
 * Sets up the routing structure with:
 * - AppProvider: Provides application-wide context (theme, language, etc.)
 * - AuthProvider: Manages authentication state and user session
 * - BrowserRouter: Enables client-side routing
 * - Routes: Defines all application routes with language support
 * - ToastContainer: Displays toast notifications
 */
function App() {
  logger.info('App component mounted');

  // Get all possible translations for each route
  // This allows routes to work in all supported languages
  const loginPaths = getRoutePaths('login');        // ['login', 'prihlasenie', 'prihlaseni']
  const registerPaths = getRoutePaths('register');  // ['register', 'registracia', 'registrace']
  const homepagePaths = getRoutePaths('homepage');  // ['homepage', 'domov', 'domu']

  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Header component - shown on all pages */}
          <Header />
          <Routes>
            {/* 
              Root path redirects to default language (first language in supportedLanguages array)
              Example: / -> /en
            */}
            <Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

            {/* 
              Language-based routes - all routes are prefixed with language code
              Example: /en/login, /sk/prihlasenie, /cz/prihlaseni
              LanguageRouter component handles language detection and validation
            */}
            <Route path="/:lang" element={<LanguageRouter />}>
              {/* 
                Index route (homepage) - guest only
                GuestRoute redirects to protected homepage if user is already authenticated
                Example: /en -> shows HomePage (guest) or redirects to /en/homepage (authenticated)
              */}
              <Route
                index
                element={
                  <GuestRoute>
                    <HomePage />
                  </GuestRoute>
                }
              />

              {/* 
                Login route with all language translations - guest only
                GuestRoute prevents authenticated users from accessing login page
                Maps all login translations: /en/login, /sk/prihlasenie, /cz/prihlaseni
              */}
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

              {/* 
                Register route with all language translations - guest only
                GuestRoute prevents authenticated users from accessing register page
                Maps all register translations: /en/register, /sk/registracia, /cz/registrace
              */}
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

              {/* 
                Protected homepage route with all language translations
                ProtectedRoute requires authentication - redirects to login if not authenticated
                Maps all homepage translations: /en/homepage, /sk/domov, /cz/domu
              */}
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

              {/* 
                Catch-all route for invalid paths within language context
                Redirects to parent route (language root)
                Example: /en/invalid-path -> /en
              */}
              <Route path="*" element={<Navigate to=".." replace />} />
            </Route>

            {/* 
              Global catch-all route - redirects any invalid path to default language
              Example: /invalid-path -> /en
            */}
            <Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
          </Routes>
        </BrowserRouter>
        {/* 
          Toast notification container - displays success/error messages
          Configured to show at top-center, auto-close after 5 seconds
        */}
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
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
