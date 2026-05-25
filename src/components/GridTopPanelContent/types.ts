import type { GridComponentType } from '../PageGridLayout';

export type GridTopPanelContentProps = {
	state: { mode: 'create'; componentType: GridComponentType };
	/** After successful create — close whole top panel */
	onSavedClose: () => void;
	/** Cancel / back — clear grid view, keep panel open on settings tabs */
	onCancel: () => void;
};
