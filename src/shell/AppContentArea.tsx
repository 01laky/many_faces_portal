import type { ReactNode } from 'react';

/** Side panel + `<main>` column inside `app-layout` (composition only). */
export function AppContentArea({ children }: { children: ReactNode }) {
	return <div className="app-content-area">{children}</div>;
}
