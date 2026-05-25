import type { GridComponentType } from '../PageGridLayout';
import { GRID_TOP_PANEL_CREATE_LABEL } from './constants';

export function gridTopPanelHeaderTitle(state: { componentType: GridComponentType }): string {
	const label = GRID_TOP_PANEL_CREATE_LABEL[state.componentType];
	return `Create ${label}`;
}
