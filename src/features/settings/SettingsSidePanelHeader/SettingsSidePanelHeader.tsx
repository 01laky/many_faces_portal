import {
	X,
	UserRound,
	MessageCircle,
	Bell,
	Shield,
	ShieldBan,
	UserCheck,
	ArrowLeft,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { gridTopPanelHeaderTitle } from '../../../components/gridTopPanelCreateMeta';
import { shouldShowFaceRolePanel } from '../../../components/FaceRoleSelectPanel';
import type { SettingsSidePanelHeaderProps } from './types';

export function SettingsSidePanelHeader({
	gridTopPanel,
	settingsTab,
	setSettingsTab,
	setGridTopPanel,
	onClosePanel,
}: SettingsSidePanelHeaderProps) {
	const { t } = useTranslation('common');
	const { isAuthenticated } = useAuth();
	const { selectedFace } = useFaceConfig();

	return (
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
					<h2 className="grid-top-panel-header-title">{gridTopPanelHeaderTitle(gridTopPanel)}</h2>
					<button
						className="settings-panel-close"
						onClick={onClosePanel}
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
						onClick={onClosePanel}
						type="button"
						aria-label={t('settingsPanel.closePanel')}
					>
						<X size={20} />
					</button>
				</>
			)}
		</div>
	);
}
