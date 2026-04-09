/**
 * PageGridLayout - Read-only display of a page's grid layout
 *
 * Renders grid items from the page's gridSchema JSON.
 * Each item is wrapped in ComponentBlock (header, footer, slide-out) with unified style.
 */

import { useMemo, useState, useEffect } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import { ComponentBlock } from './ComponentBlock';
import {
  Album,
  AlbumGrid,
  AlbumCarousel,
  Ad,
  AdGrid,
  AdCarousel,
  Blog,
  BlogGrid,
  BlogCarousel,
  ChatRoom,
  ChatRoomGrid,
  ChatRoomCarousel,
  UserProfile,
  UserProfileGrid,
  UserProfileCarousel,
  Reel,
  ReelGrid,
  ReelCarousel,
  Story,
  StoryGrid,
  StoryCarousel,
} from './grid';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './PageGridLayout.scss';

const COMPONENT_SETTINGS_PREFIX = 'component-settings-';

function readBlockAutoplay(componentId: string): boolean {
  try {
    const raw = localStorage.getItem(COMPONENT_SETTINGS_PREFIX + componentId);
    if (!raw) return false;
    return Boolean(JSON.parse(raw).autoplay);
  } catch {
    return false;
  }
}

const HAS_FOOTER: Record<GridComponentType, boolean> = {
  album: false,
  albumGrid: true,
  albumCarousel: true,
  ad: false,
  adGrid: true,
  adCarousel: true,
  blog: false,
  blogGrid: true,
  blogCarousel: true,
  chatRoom: false,
  chatRoomGrid: true,
  chatRoomCarousel: true,
  userProfile: false,
  userProfileGrid: true,
  userProfileCarousel: true,
  reel: false,
  reelGrid: true,
  reelCarousel: true,
  story: false,
  storyGrid: true,
  storyCarousel: true,
};

export type GridComponentType =
  | 'album'
  | 'albumGrid'
  | 'albumCarousel'
  | 'ad'
  | 'adGrid'
  | 'adCarousel'
  | 'blog'
  | 'blogGrid'
  | 'blogCarousel'
  | 'chatRoom'
  | 'chatRoomGrid'
  | 'chatRoomCarousel'
  | 'userProfile'
  | 'userProfileGrid'
  | 'userProfileCarousel'
  | 'reel'
  | 'reelGrid'
  | 'reelCarousel'
  | 'story'
  | 'storyGrid'
  | 'storyCarousel';

interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  label?: string;
  componentType?: GridComponentType;
  /** Title shown in component header (from admin) */
  title?: string | null;
  /** Icon key for header (from admin) */
  icon?: string | null;
  /** When set, single `chatRoom` tile loads this room; otherwise first room in the face */
  boundChatRoomId?: number;
}

interface GridSchema {
  items: GridItem[];
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
  rowHeight: number;
}

interface PageGridLayoutProps {
  gridSchemaJson: string;
}

export function PageGridLayout({ gridSchemaJson }: PageGridLayoutProps) {
  const { width, containerRef } = useContainerWidth();

  const schema = useMemo<GridSchema | null>(() => {
    try {
      return JSON.parse(gridSchemaJson);
    } catch {
      return null;
    }
  }, [gridSchemaJson]);

  const layouts = useMemo<ResponsiveLayouts>(() => {
    if (!schema) return {};
    const baseLayout: LayoutItem[] = schema.items.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      static: true, // non-draggable, non-resizable
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
    if (!autoplayingItemId) return;
    const id = autoplayingItemId;
    const interval = window.setInterval(() => {
      setPagination((prev) => {
        const cur = prev[id];
        if (!cur || cur.totalPages <= 1) return prev;
        const nextPage = cur.page >= cur.totalPages - 1 ? 0 : cur.page + 1;
        return { ...prev, [id]: { ...cur, page: nextPage } };
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [autoplayingItemId]);

  if (!schema || !schema.items || schema.items.length === 0) {
    return null;
  }

  function renderChild(
    item: GridItem,
    paginationState: { page: number; totalPages: number } | undefined,
    onPageChange: ((page: number, totalPages: number) => void) | undefined
  ) {
    const ct = item.componentType;
    const controlled = ct && HAS_FOOTER[ct];
    const page = paginationState?.page ?? 0;
    const totalPages = Math.max(1, paginationState?.totalPages ?? 1);
    const onChange = controlled && onPageChange ? onPageChange : undefined;
    if (ct === 'album') return <Album />;
    if (ct === 'albumGrid')
      return <AlbumGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'albumCarousel')
      return <AlbumCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'ad') return <Ad />;
    if (ct === 'adGrid')
      return <AdGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'adCarousel')
      return <AdCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'blog') return <Blog />;
    if (ct === 'blogGrid')
      return <BlogGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'blogCarousel')
      return <BlogCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'chatRoom') return <ChatRoom boundChatRoomId={item.boundChatRoomId} />;
    if (ct === 'chatRoomGrid')
      return <ChatRoomGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'chatRoomCarousel')
      return <ChatRoomCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'userProfile') return <UserProfile />;
    if (ct === 'userProfileGrid')
      return <UserProfileGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'userProfileCarousel')
      return <UserProfileCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'reel') return <Reel />;
    if (ct === 'reelGrid')
      return <ReelGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'reelCarousel')
      return <ReelCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'story') return <Story />;
    if (ct === 'storyGrid')
      return <StoryGrid page={page} totalPages={totalPages} onPageChange={onChange} />;
    if (ct === 'storyCarousel')
      return <StoryCarousel page={page} totalPages={totalPages} onPageChange={onChange} />;
    return <span className="page-grid-item-label">{item.label || item.i}</span>;
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
          const hasFooter = ct ? HAS_FOOTER[ct] : false;
          const paginationState = pagination[item.i];
          const page = paginationState?.page ?? 0;
          const totalPages = Math.max(1, paginationState?.totalPages ?? 1);
          const setPage = (delta: number) => {
            setPagination((prev) => {
              const cur = prev[item.i] ?? { page: 0, totalPages: 1 };
              const nextPage = Math.max(0, Math.min(cur.totalPages - 1, cur.page + delta));
              return { ...prev, [item.i]: { ...cur, page: nextPage } };
            });
          };
          if (!ct) {
            return (
              <div key={item.i} className="page-grid-item">
                <span className="page-grid-item-label">{item.label || item.i}</span>
              </div>
            );
          }
          return (
            <div key={item.i} className="page-grid-item">
              <ComponentBlock
                componentId={item.i}
                componentType={ct}
                title={item.title ?? item.label}
                icon={item.icon}
                page={page}
                totalPages={totalPages}
                onPrev={hasFooter ? () => setPage(-1) : undefined}
                onNext={hasFooter ? () => setPage(1) : undefined}
                onPlayPause={hasFooter ? playPauseByItemId.get(item.i) : undefined}
                autoplayFromStorage={hasFooter ? readBlockAutoplay(item.i) : false}
              >
                {renderChild(item, paginationState, pageChangeByItemId.get(item.i))}
              </ComponentBlock>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
