import { createContext, useContext } from 'react';
import type { GridTopPanelContextValue, GridTopPanelProviderProps } from './types';

export type { GridTopPanelContextValue, GridTopPanelState } from './types';

const GridTopPanelContext = createContext<GridTopPanelContextValue | null>(null);

export function GridTopPanelProvider({ children, value }: GridTopPanelProviderProps) {
	return <GridTopPanelContext.Provider value={value}>{children}</GridTopPanelContext.Provider>;
}

export function useGridTopPanel(): GridTopPanelContextValue {
	const ctx = useContext(GridTopPanelContext);
	if (!ctx) {
		throw new Error('useGridTopPanel must be used within GridTopPanelProvider');
	}
	return ctx;
}
