import type { ReactNode } from 'react';

export interface AppBrandTitleProps {
	children?: ReactNode;
	className?: string;
}

/** App name in Sweetest Cat Ever (see `styles/appBrandFont.scss`). */
export function AppBrandTitle({ children, className }: AppBrandTitleProps) {
	const classes = ['app-brand-font', className].filter(Boolean).join(' ');
	return <span className={classes}>{children}</span>;
}
