import type { GridTopPanelState } from '../../../contexts/GridTopPanelContext';
import type { SettingsTabId } from '../types';

export interface SettingsSidePanelHeaderProps {
	gridTopPanel: GridTopPanelState;
	settingsTab: SettingsTabId;
	setSettingsTab: (tab: SettingsTabId) => void;
	setGridTopPanel: (v: GridTopPanelState) => void;
	onClosePanel: () => void;
}
