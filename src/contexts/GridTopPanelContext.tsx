import { createContext, useContext, type ReactNode } from 'react';
import type { GridComponentType } from '../components/PageGridLayout';

export type GridTopPanelState = null | { mode: 'create'; componentType: GridComponentType };

export type GridTopPanelContextValue = {
	gridTopPanel: GridTopPanelState;
	openGridCreate: (componentType: GridComponentType) => void;
	closeGridPanel: () => void;
};

const GridTopPanelContext = createContext<GridTopPanelContextValue | null>(null);

export function GridTopPanelProvider({
	children,
	value,
}: {
	children: ReactNode;
	value: GridTopPanelContextValue;
}) {
	return <GridTopPanelContext.Provider value={value}>{children}</GridTopPanelContext.Provider>;
}

export function useGridTopPanel(): GridTopPanelContextValue {
	const ctx = useContext(GridTopPanelContext);
	if (!ctx) {
		throw new Error('useGridTopPanel must be used within GridTopPanelProvider');
	}
	return ctx;
}
