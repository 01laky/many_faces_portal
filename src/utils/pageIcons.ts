import { Home, FileText, FileBox, LogIn, UserPlus, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Map page name / path / type to a lucide icon */
export function getPageIcon(
	pageName: string,
	pagePath: string,
	pageTypeIndex?: string
): LucideIcon {
	const name = pageName.toLowerCase();
	const path = pagePath.toLowerCase();
	const typeIdx = (pageTypeIndex ?? '').toLowerCase();

	if (typeIdx === 'home') return Home;
	if (typeIdx === 'static') return FileBox;
	if (typeIdx === 'wall') return FileText;

	if (name.includes('home') || path.includes('home')) return Home;
	if (name.includes('wall') || path.includes('wall')) return FileText;
	if (name.includes('detail') || path.includes('detail')) return FileText;
	if (name.includes('login') || path.includes('login')) return LogIn;
	if (name.includes('register') || path.includes('register')) return UserPlus;
	if (name.includes('setting') || path.includes('setting')) return Settings;

	return FileBox;
}
