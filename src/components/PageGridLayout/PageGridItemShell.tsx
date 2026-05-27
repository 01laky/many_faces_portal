import { memo, type ReactNode } from 'react';
import { ComponentBlock } from '../ComponentBlock';
import { GridBlockFetchProvider } from '../../contexts/GridBlockFetchContext';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import type { GridComponentType } from '../../utils/pageGridSchema';

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

/** Memoized grid item shell — limits re-renders on sibling pagination (PT-RP24). */
export const PageGridItemShell = memo(function PageGridItemShell({
	itemId,
	componentType,
	title,
	icon,
	page,
	totalPages,
	onPrev,
	onNext,
	onPlayPause,
	autoplayFromStorage,
	children,
}: PageGridItemShellProps) {
	const { ref, inView } = useInViewOnce();

	return (
		<div ref={ref} className="page-grid-item" data-grid-item-id={itemId}>
			<GridBlockFetchProvider fetchEnabled={inView}>
				<ComponentBlock
					componentId={itemId}
					componentType={componentType}
					title={title}
					icon={icon}
					page={page}
					totalPages={totalPages}
					onPrev={onPrev}
					onNext={onNext}
					onPlayPause={onPlayPause}
					autoplayFromStorage={autoplayFromStorage}
				>
					{children}
				</ComponentBlock>
			</GridBlockFetchProvider>
		</div>
	);
});
