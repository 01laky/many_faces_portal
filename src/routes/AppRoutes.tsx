import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { GridTopPanelProvider, type GridTopPanelState } from '../contexts/GridTopPanelContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoriesCreateTopPanel } from '../components/StoriesCreateTopPanel';
import { WallTicketCreateTopPanel } from '../components/WallTicketCreateTopPanel';
import { pathnameMatchesWallPage } from '../utils/faceWallPage';
import { useWallHostViewer } from '../hooks/useWallHostViewer';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import { useTranslation } from 'react-i18next';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import { useGradientAnimationPreference } from '../contexts/GradientAnimationPreferenceContext';
import { isFirstVisitToFace } from '../components/FaceRoleSelectPanel';
import type { GridComponentType } from '../components/PageGridLayout';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { supportedLanguages } from '../i18n/constants';
import { AppWorkspace } from '../shell/AppWorkspace';
import { AppContentArea } from '../shell/AppContentArea';
import { SettingsSidePanel } from '../features/settings';
import type { SettingsTabId } from '../features/settings';
import { RouteLoadingFallback } from './routeLoadingFallback';
import { buildLanguageNestedRoutes } from './buildLanguageNestedRoutes';
import { useFaceRouteEntries } from './useFaceRouteEntries';
import { useTranslatedRoutePaths } from './useTranslatedRoutePaths';
import '../styles/toast.scss';

/**
 * Route tree + app chrome. Depends on `FaceConfigProvider` + `AuthProvider`.
 */
export function AppRoutes() {
	const { i18n } = useTranslation('common');
	const { isAuthenticated, token } = useAuth();
	const getLocalizedPath = useLocalizedLink();
	const { selectedFace } = useFaceConfig();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [settingsTab, setSettingsTab] = useState<SettingsTabId>('settings');
	const [gridTopPanel, setGridTopPanel] = useState<GridTopPanelState>(null);
	const [storiesCreateOpen, setStoriesCreateOpen] = useState(false);
	const [wallCreateOpen, setWallCreateOpen] = useState(false);
	const [wallRefreshKey, setWallRefreshKey] = useState(0);
	const location = useLocation();
	const { animationEnabled } = useGradientAnimationPreference();
	const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings, animationEnabled);
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

	const faceRoutes = useFaceRouteEntries(selectedFace);
	const { loginPaths, registerPaths, homepagePaths, profilePaths, usersPaths } =
		useTranslatedRoutePaths(i18n);

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

	useEffect(() => {
		if (!isAuthenticated || !token) return;
		if (!selectedFace || selectedFace.isPublic) return;
		if (!isFirstVisitToFace(selectedFace)) return;
		const id = window.setTimeout(() => {
			setGridTopPanel(null);
			setSettingsOpen(true);
			setSettingsTab('faceRole');
		}, 0);
		return () => clearTimeout(id);
	}, [selectedFace, isAuthenticated, token]);

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

	useEffect(() => {
		if (!env.debugMode) return;
		logger.info('AppRoutes state', {
			isAuthenticated,
			selectedFaceId: selectedFace?.id,
			selectedFaceIndex: selectedFace?.index,
		});
	}, [isAuthenticated, selectedFace?.id, selectedFace?.index]);

	return (
		<GridTopPanelProvider value={gridTopPanelApi}>
			<AppWorkspace className={`app-layout ${settingsOpen ? 'app-layout--settings-open' : ''}`}>
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
				<AppContentArea>
					<SettingsSidePanel
						open={settingsOpen}
						gradientStyle={gradientVars}
						gridTopPanel={gridTopPanel}
						settingsTab={settingsTab}
						setSettingsTab={setSettingsTab}
						setGridTopPanel={setGridTopPanel}
						onClosePanel={handleClosePanel}
						closeGridPanel={closeGridPanel}
						onGridCreateSavedClose={handleGridCreateSavedClose}
						onSettingsNavigate={() => setSettingsOpen(false)}
					/>
					<main className="app-content">
						<Suspense fallback={<RouteLoadingFallback />}>
							<Routes>
								<Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
								{buildLanguageNestedRoutes({
									faceRoutes,
									wallRefreshKey,
									loginPaths,
									registerPaths,
									homepagePaths,
									profilePaths,
									usersPaths,
									token,
								})}
								<Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
							</Routes>
						</Suspense>
					</main>
				</AppContentArea>
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
			</AppWorkspace>
		</GridTopPanelProvider>
	);
}
