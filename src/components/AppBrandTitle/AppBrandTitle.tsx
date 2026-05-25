import type { AppBrandTitleProps } from './types';

/** App name in Sweetest Cat Ever (see `styles/appBrandFont.scss`). */
export function AppBrandTitle({ children, className }: AppBrandTitleProps) {
	const classes = ['app-brand-font', className].filter(Boolean).join(' ');
	return <span className={classes}>{children}</span>;
}
