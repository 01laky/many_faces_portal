import { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface SimpleVirtualListProps<T> {
	items: T[];
	estimateSize?: number;
	className?: string;
	getKey: (item: T, index: number) => string | number;
	renderItem: (item: T, index: number) => ReactNode;
	footer?: ReactNode;
}

/** Minimal virtualizer wrapper for message threads (PT-RP12). */
export function SimpleVirtualList<T>({
	items,
	estimateSize = 72,
	className,
	getKey,
	renderItem,
	footer,
}: SimpleVirtualListProps<T>) {
	const parentRef = useRef<HTMLDivElement>(null);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual API (PT-RP12)
	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize,
		overscan: 8,
	});

	return (
		<div ref={parentRef} className={className} style={{ overflow: 'auto', maxHeight: '100%' }}>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{virtualizer.getVirtualItems().map((virtualRow) => {
					const item = items[virtualRow.index];
					return (
						<div
							key={getKey(item, virtualRow.index)}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							{renderItem(item, virtualRow.index)}
						</div>
					);
				})}
			</div>
			{footer}
		</div>
	);
}
