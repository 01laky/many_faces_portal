import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import type { GridTopPanelState } from '../../../contexts/GridTopPanelContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { AnimatedGradientToggle } from '../AnimatedGradientToggle';
import { FriendRequestsTab } from '../../../components/FriendRequestsTab';
import { MessengerTab } from '../../../components/MessengerTab';
import { NotificationsTab } from '../../../components/NotificationsTab';
import { BlockListTab } from '../../../components/BlockListTab';
import { FollowTab } from '../../../components/FollowTab';
import { FaceRoleSelectPanel } from '../../../components/FaceRoleSelectPanel';
import { EditProfileTab } from '../../../components/EditProfileTab';
import { GridTopPanelContent } from '../../../components/GridTopPanelContent';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { parseGradientSettings } from '../../../hooks/useAnimatedGradient';
import { PagesNav } from '../PagesNav';
import type { SettingsTabId } from '../types';

export interface SettingsSidePanelBodyProps {
  gridTopPanel: GridTopPanelState;
  settingsTab: SettingsTabId;
  closeGridPanel: () => void;
  onGridCreateSavedClose: () => void;
  onSettingsNavigate: () => void;
}

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
  );
}
