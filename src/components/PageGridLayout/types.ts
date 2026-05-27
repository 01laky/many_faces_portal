import type { ReactNode } from 'react';
import type { GridComponentType } from '../../utils/pageGridSchema';

export interface PageGridLayoutProps {
	gridSchemaJson: string;
}

export type PageGridItemShellProps = {
	itemId: string;
	componentType: GridComponentType;
	title?: string;
	icon?: string;
	page: number;
	totalPages: number;
	onPrev?: () => void;
	onNext?: () => void;
	onPlayPause?: (playing: boolean) => void;
	autoplayFromStorage: boolean;
	children: ReactNode;
};
