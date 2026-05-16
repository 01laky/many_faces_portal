import { SettingsSidePanelHeader } from '../SettingsSidePanelHeader';
import { SettingsSidePanelBody } from '../SettingsSidePanelBody';
import type { SettingsSidePanelShellProps } from '../types';

export type { SettingsSidePanelShellProps as SettingsSidePanelProps } from '../types';

export function SettingsSidePanel({
  open,
  gradientStyle,
  gridTopPanel,
  settingsTab,
  setSettingsTab,
  setGridTopPanel,
  onClosePanel,
  closeGridPanel,
  onGridCreateSavedClose,
  onSettingsNavigate,
}: SettingsSidePanelShellProps) {
  return (
    <div className={`settings-panel ${open ? 'settings-panel--open' : ''}`} style={gradientStyle}>
      <SettingsSidePanelHeader
        gridTopPanel={gridTopPanel}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        setGridTopPanel={setGridTopPanel}
        onClosePanel={onClosePanel}
      />
      <div className="settings-panel-body">
        <SettingsSidePanelBody
          gridTopPanel={gridTopPanel}
          settingsTab={settingsTab}
          closeGridPanel={closeGridPanel}
          onGridCreateSavedClose={onGridCreateSavedClose}
          onSettingsNavigate={onSettingsNavigate}
        />
      </div>
    </div>
  );
}
