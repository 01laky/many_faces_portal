import type { GridTopPanelState } from '../../../contexts/GridTopPanelContext';
import type { SettingsTabId } from '../types';

export interface SettingsSidePanelBodyProps {
	gridTopPanel: GridTopPanelState;
	settingsTab: SettingsTabId;
	closeGridPanel: () => void;
	onGridCreateSavedClose: () => void;
	onSettingsNavigate: () => void;
}
