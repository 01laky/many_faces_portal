import { lazy, Suspense } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { AnimatedGradientToggle } from '../AnimatedGradientToggle';
import { FaceRoleSelectPanel } from '../../../components/FaceRoleSelectPanel';
import { GridTopPanelContent } from '../../../components/GridTopPanelContent';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { parseGradientSettings } from '../../../hooks/useAnimatedGradient';
import { usePrefetchFaceHomeQueries } from '../../../hooks/usePrefetchFaceHomeQueries';
import { PagesNav } from '../PagesNav';
import { RouteLoadingFallback } from '../../../routes/routeLoadingFallback';
import type { SettingsSidePanelBodyProps } from './types';
import { shouldMountMessengerSettingsTab } from '../../../utils/settingsMessengerTabGate';

const LazyEditProfileTab = lazy(() =>
	import('../../../components/EditProfileTab').then((m) => ({ default: m.EditProfileTab }))
);
const LazyFriendRequestsTab = lazy(() =>
	import('../../../components/FriendRequestsTab').then((m) => ({ default: m.FriendRequestsTab }))
);
const LazyMessengerTab = lazy(() =>
	import('../../../components/MessengerTab').then((m) => ({ default: m.MessengerTab }))
);
const LazyNotificationsTab = lazy(() =>
	import('../../../components/NotificationsTab').then((m) => ({ default: m.NotificationsTab }))
);
const LazyBlockListTab = lazy(() =>
	import('../../../components/BlockListTab').then((m) => ({ default: m.BlockListTab }))
);
const LazyFollowTab = lazy(() =>
	import('../../../components/FollowTab').then((m) => ({ default: m.FollowTab }))
);

export function SettingsSidePanelBody({
	gridTopPanel,
	settingsTab,
	closeGridPanel,
	onGridCreateSavedClose,
	onSettingsNavigate,
}: SettingsSidePanelBodyProps) {
	const { t } = useTranslation('common');
	const { isAuthenticated, token, logout } = useAuth();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { availableFaces, selectedFace, selectFace, reload } = useFaceConfig();
	const { prefetchFaceHome, cancelPrefetch } = usePrefetchFaceHomeQueries(token);

	if (gridTopPanel?.mode === 'create') {
		return (
			<GridTopPanelContent
				state={gridTopPanel}
				onSavedClose={onGridCreateSavedClose}
				onCancel={closeGridPanel}
			/>
		);
	}

	return (
		<>
			{settingsTab === 'profile' && (
				<Suspense fallback={<RouteLoadingFallback />}>
					<LazyEditProfileTab />
				</Suspense>
			)}
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
					<AnimatedGradientToggle />
					{isAuthenticated && (
						<div className="settings-section" style={{ marginTop: 16 }}>
							<button
								type="button"
								className="settings-logout-btn"
								onClick={async () => {
									onSettingsNavigate();
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
								onMouseEnter={() => prefetchFaceHome(face)}
								onMouseLeave={cancelPrefetch}
								onFocus={() => prefetchFaceHome(face)}
								onBlur={cancelPrefetch}
								type="button"
							>
								<div className="face-card-preview" style={{ background: gradientBg }} />
								<div className="face-card-info">
									<span className="face-card-title">{face.title}</span>
									{face.description && <span className="face-card-desc">{face.description}</span>}
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
			{settingsTab === 'pages' && <PagesNav onNavigate={onSettingsNavigate} />}
			{settingsTab === 'friendRequests' && token && (
				<div className="settings-panel-body-fill">
					<Suspense fallback={<RouteLoadingFallback />}>
						<LazyFriendRequestsTab token={token} />
					</Suspense>
				</div>
			)}
			{shouldMountMessengerSettingsTab(settingsTab, token) && (
				<Suspense fallback={<RouteLoadingFallback />}>
					<LazyMessengerTab token={token!} />
				</Suspense>
			)}
			{settingsTab === 'notifications' && token && (
				<Suspense fallback={<RouteLoadingFallback />}>
					<LazyNotificationsTab token={token} />
				</Suspense>
			)}
			{settingsTab === 'blockList' && token && (
				<div className="settings-panel-body-fill">
					<Suspense fallback={<RouteLoadingFallback />}>
						<LazyBlockListTab token={token} />
					</Suspense>
				</div>
			)}
			{settingsTab === 'follows' && token && (
				<div className="settings-panel-body-fill">
					<Suspense fallback={<RouteLoadingFallback />}>
						<LazyFollowTab token={token} />
					</Suspense>
				</div>
			)}
		</>
	);
}
