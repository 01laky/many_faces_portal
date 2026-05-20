/**
 * App shell — providers and router. Route tree lives in `src/routes/AppRoutes.tsx`.
 */
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiContextProvider } from './contexts/ApiContext';
import { MessengerProvider } from './contexts/MessengerContext';
import { FaceConfigProvider } from './contexts/FaceConfigContext';
import { GradientAnimationPreferenceProvider } from './contexts/GradientAnimationPreferenceContext';
import { AppRoutes } from './routes';

function MessengerProviderWithToken({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return <MessengerProvider token={token}>{children}</MessengerProvider>;
}

function ApiContextProviderWithToken({ children }: { children: ReactNode }) {
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
                <GradientAnimationPreferenceProvider>
                  <AppRoutes />
                </GradientAnimationPreferenceProvider>
              </FaceConfigProvider>
            </MessengerProviderWithToken>
          </ApiContextProviderWithToken>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
export { AppRoutes };
