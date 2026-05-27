import { createContext, useContext, type ReactNode } from 'react';

const GridBlockFetchContext = createContext(true);

/** When false, grid blocks defer Query fetch until visible (PT-RP16). */
export function GridBlockFetchProvider({
	fetchEnabled,
	children,
}: {
	fetchEnabled: boolean;
	children: ReactNode;
}) {
	return (
		<GridBlockFetchContext.Provider value={fetchEnabled}>{children}</GridBlockFetchContext.Provider>
	);
}

export function useGridBlockFetchEnabled(): boolean {
	return useContext(GridBlockFetchContext);
}
