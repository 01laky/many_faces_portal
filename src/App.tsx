/**
 * App shell — providers and router. Route tree lives in `src/routes/AppRoutes.tsx`.
 */
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiContextProvider } from './contexts/ApiContext';
import { MessengerProvider } from './contexts/MessengerContext';
import { MessengerHubGateProvider, useMessengerHubGate } from './contexts/MessengerHubGateContext';
import { FaceConfigProvider } from './contexts/FaceConfigContext';
import { GradientAnimationPreferenceProvider } from './contexts/GradientAnimationPreferenceContext';
import { AppBootstrapGate } from './components/AppBootstrapGate';
import { AppRoutes } from './routes';
import { resolveMessengerHubEnabled } from './utils/messengerHubGate';

/**
 * Footer messenger badge needs a live hub while authenticated (PT-RP9).
 * Set to false to connect only when settings messenger tab is open.
 */
const MESSENGER_HUB_ALWAYS_FOR_BADGE = true;

function MessengerProviderWithToken({ children }: { children: ReactNode }) {
	const { token, isAuthenticated } = useAuth();
	const { messengerTabActive } = useMessengerHubGate();
	const messengerEnabled = resolveMessengerHubEnabled({
		isAuthenticated,
		token,
		alwaysForBadge: MESSENGER_HUB_ALWAYS_FOR_BADGE,
		messengerTabActive,
	});
	return (
		<MessengerProvider token={token} messengerEnabled={messengerEnabled}>
			{children}
		</MessengerProvider>
	);
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
					<MessengerHubGateProvider>
						<ApiContextProviderWithToken>
							<MessengerProviderWithToken>
								<FaceConfigProvider>
									<GradientAnimationPreferenceProvider>
										<AppBootstrapGate>
											<AppRoutes />
										</AppBootstrapGate>
									</GradientAnimationPreferenceProvider>
								</FaceConfigProvider>
							</MessengerProviderWithToken>
						</ApiContextProviderWithToken>
					</MessengerHubGateProvider>
				</AuthProvider>
			</AppProvider>
		</BrowserRouter>
	);
}

export default App;
export { AppRoutes };
