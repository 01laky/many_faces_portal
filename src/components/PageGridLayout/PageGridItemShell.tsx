import { memo, forwardRef, type HTMLAttributes } from 'react';
import { ComponentBlock } from '../ComponentBlock';
import { GridBlockFetchProvider } from '../../contexts/GridBlockFetchContext';
import { useInViewOnce } from '../../hooks/useInViewOnce';
import type { PageGridItemShellProps } from './types';

/**
 * Memoized grid item shell — limits re-renders on sibling pagination (PT-RP24).
 *
 * react-grid-layout positions every grid item by CLONING this child and injecting the props that do
 * the positioning: `style` (absolute position + width/height), `className` ("react-grid-item …"),
 * a `ref` (used to measure the node), and the drag/resize handlers. This component MUST therefore be a
 * `forwardRef` and forward those injected props onto its root <div>; otherwise the injected style/class/ref
 * are dropped, the item loses its absolute positioning and reflows to the full container width (the
 * "schema doesn't compose, every block is full-width and stacked" bug). The injected props arrive as
 * `className` + the rest spread (`...gridProps`, which carries `style` and any handlers); we merge the
 * class with our own `page-grid-item` and compose RGL's ref with the lazy-load in-view ref.
 */
export const PageGridItemShell = memo(
	forwardRef<HTMLDivElement, PageGridItemShellProps & HTMLAttributes<HTMLDivElement>>(
		function PageGridItemShell(
			{
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
				className,
				...gridProps
			},
			gridItemRef
		) {
			const { ref: inViewRef, inView } = useInViewOnce();

			return (
				<div
					// Compose react-grid-layout's measuring ref with the lazy-load in-view ref so BOTH keep working.
					ref={(node) => {
						inViewRef(node);
						if (typeof gridItemRef === 'function') {
							gridItemRef(node);
						} else if (gridItemRef) {
							gridItemRef.current = node;
						}
					}}
					// Merge RGL's injected "react-grid-item …" class with ours so positioning + our styling both apply.
					className={['page-grid-item', className].filter(Boolean).join(' ')}
					data-grid-item-id={itemId}
					// Spreads RGL's injected `style` (absolute position + size) and any drag/resize handlers onto the node.
					{...gridProps}
				>
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
		}
	)
);
