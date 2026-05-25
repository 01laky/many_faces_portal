import type { CSSProperties } from 'react';
import type { GridTopPanelState } from '../../contexts/GridTopPanelContext';

export type SettingsTabId =
	| 'settings'
	| 'profile'
	| 'faceRole'
	| 'friendRequests'
	| 'messenger'
	| 'notifications'
	| 'blockList'
	| 'follows'
	| 'faces'
	| 'pages';

export interface SettingsSidePanelShellProps {
	open: boolean;
	gradientStyle: CSSProperties;
	gridTopPanel: GridTopPanelState;
	settingsTab: SettingsTabId;
	setSettingsTab: (tab: SettingsTabId) => void;
	setGridTopPanel: (v: GridTopPanelState) => void;
	onClosePanel: () => void;
	closeGridPanel: () => void;
	onGridCreateSavedClose: () => void;
	onSettingsNavigate: () => void;
}
