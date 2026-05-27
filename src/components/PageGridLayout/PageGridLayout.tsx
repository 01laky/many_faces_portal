/**
 * PageGridLayout - Read-only display of a page's grid layout
 *
 * Renders grid items from the page's gridSchema JSON.
 * PT-RP1: dynamic lazy grid blocks; PT-RP19: pause autoplay when tab hidden.
 */

import { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import { RouteLoadingFallback } from '../../routes/routeLoadingFallback';
import { getLazyGridBlock, isKnownGridComponentType } from '../grid/gridBlockRegistry';
import {
	advanceCarouselPage,
	parsePageGridSchema,
	readComponentBlockAutoplay,
	type PageGridSchema,
} from '../../utils/pageGridSchema';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './PageGridLayout.scss';
import { HAS_FOOTER } from './constants';
import { PageGridItemShell } from './PageGridItemShell';
import type { PageGridLayoutProps } from './types';

export type { GridComponentType } from '../../utils/pageGridSchema';

function LazyGridBlock({
	componentType,
	props,
}: {
	componentType: string;
	props: Record<string, unknown>;
}) {
	const LazyComp = useMemo(
		() => (isKnownGridComponentType(componentType) ? getLazyGridBlock(componentType) : null),
		[componentType]
	);
	if (!LazyComp) {
		return <span className="page-grid-item-label">{componentType}</span>;
	}
	return (
		<Suspense fallback={<RouteLoadingFallback />}>
			{/* getLazyGridBlock returns stable cached lazy refs (PT-RP1) */}
			{/* eslint-disable-next-line react-hooks/static-components */}
			<LazyComp {...props} />
		</Suspense>
	);
}

export function PageGridLayout({ gridSchemaJson }: PageGridLayoutProps) {
	const { width, containerRef } = useContainerWidth();

	const schema = useMemo<PageGridSchema | null>(
		() => parsePageGridSchema(gridSchemaJson),
		[gridSchemaJson]
	);

	const layouts = useMemo<ResponsiveLayouts>(() => {
		if (!schema) return {};
		const baseLayout: LayoutItem[] = schema.items.map((item) => ({
			i: item.i,
			x: item.x,
			y: item.y,
			w: item.w,
			h: item.h,
			static: true,
		}));
		return {
			lg: baseLayout,
			md: baseLayout,
			sm: baseLayout,
			xs: baseLayout,
			xxs: baseLayout,
		};
	}, [schema]);

	const [pagination, setPagination] = useState<
		Record<string, { page: number; totalPages: number }>
	>({});
	const [autoplayingItemId, setAutoplayingItemId] = useState<string | null>(null);
	const [tabVisible, setTabVisible] = useState(
		typeof document === 'undefined' ? true : !document.hidden
	);

	useEffect(() => {
		if (typeof document === 'undefined') return;
		const onVis = () => setTabVisible(!document.hidden);
		document.addEventListener('visibilitychange', onVis);
		return () => document.removeEventListener('visibilitychange', onVis);
	}, []);

	const pageChangeByItemId = useMemo(() => {
		const m = new Map<string, (page: number, totalPages: number) => void>();
		const items = schema?.items;
		if (!items) return m;
		for (const it of items) {
			const id = it.i;
			m.set(id, (page, totalPages) => {
				setPagination((prev) => {
					const cur = prev[id];
					if (cur?.page === page && cur?.totalPages === totalPages) return prev;
					return { ...prev, [id]: { page, totalPages } };
				});
			});
		}
		return m;
	}, [schema]);

	const playPauseByItemId = useMemo(() => {
		const m = new Map<string, (playing: boolean) => void>();
		const items = schema?.items;
		if (!items) return m;
		for (const it of items) {
			const id = it.i;
			m.set(id, (playing: boolean) => {
				setAutoplayingItemId((cur) => {
					if (playing) return id;
					if (cur === id) return null;
					return cur;
				});
			});
		}
		return m;
	}, [schema]);

	useEffect(() => {
		if (!autoplayingItemId || !tabVisible) return;
		const id = autoplayingItemId;
		const interval = window.setInterval(() => {
			setPagination((prev) => {
				const cur = prev[id];
				if (!cur || cur.totalPages <= 1) return prev;
				const nextPage = advanceCarouselPage(cur.page, cur.totalPages);
				return { ...prev, [id]: { ...cur, page: nextPage } };
			});
		}, 4500);
		return () => clearInterval(interval);
	}, [autoplayingItemId, tabVisible]);

	const makePageDelta = useCallback((itemId: string, delta: number) => {
		setPagination((prev) => {
			const cur = prev[itemId] ?? { page: 0, totalPages: 1 };
			const nextPage = Math.max(0, Math.min(cur.totalPages - 1, cur.page + delta));
			if (nextPage === cur.page) return prev;
			return { ...prev, [itemId]: { ...cur, page: nextPage } };
		});
	}, []);

	if (!schema) {
		return null;
	}

	return (
		<div className="page-grid-layout" ref={containerRef}>
			<ResponsiveGridLayout
				className="layout"
				width={width}
				layouts={layouts}
				breakpoints={schema.breakpoints}
				cols={schema.cols}
				rowHeight={schema.rowHeight}
				dragConfig={{ enabled: false }}
				resizeConfig={{ enabled: false }}
				compactor={verticalCompactor}
				margin={[8, 8]}
			>
				{schema.items.map((item) => {
					const ct = item.componentType;
					if (!ct) {
						return (
							<div key={item.i} className="page-grid-item">
								<span className="page-grid-item-label">{item.label || item.i}</span>
							</div>
						);
					}
					const hasFooter = HAS_FOOTER[ct];
					const paginationState = pagination[item.i];
					const page = paginationState?.page ?? 0;
					const totalPages = Math.max(1, paginationState?.totalPages ?? 1);

					return (
						<PageGridItemShell
							key={item.i}
							itemId={item.i}
							componentType={ct}
							title={item.title ?? item.label}
							icon={item.icon ?? undefined}
							page={page}
							totalPages={totalPages}
							onPrev={hasFooter ? () => makePageDelta(item.i, -1) : undefined}
							onNext={hasFooter ? () => makePageDelta(item.i, 1) : undefined}
							onPlayPause={hasFooter ? playPauseByItemId.get(item.i) : undefined}
							autoplayFromStorage={hasFooter ? readComponentBlockAutoplay(item.i) : false}
						>
							<LazyGridBlock
								componentType={ct}
								props={{
									page,
									totalPages,
									onPageChange: hasFooter ? pageChangeByItemId.get(item.i) : undefined,
									...(ct === 'chatRoom' ? { boundChatRoomId: item.boundChatRoomId } : {}),
									...(ct === 'videoLounge' ? { boundVideoLoungeId: item.boundVideoLoungeId } : {}),
								}}
							/>
						</PageGridItemShell>
					);
				})}
			</ResponsiveGridLayout>
		</div>
	);
}
