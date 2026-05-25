import type { ReactNode } from 'react';

/** Outer layout wrapper for header + side panel + main + footer (composition only, no data). */
export function AppWorkspace({ className, children }: { className?: string; children: ReactNode }) {
	return <div className={className}>{children}</div>;
}
