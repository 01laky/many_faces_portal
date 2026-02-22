/**
 * PageGridLayout - Read-only display of a page's grid layout
 *
 * Renders grid items from the page's gridSchema JSON.
 * Non-editable, non-draggable, with black 2px borders on grid items.
 */

import { useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
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

type GridComponentType =
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

  if (!schema || !schema.items || schema.items.length === 0) {
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
        {schema.items.map((item) => (
          <div key={item.i} className="page-grid-item">
            {item.componentType === 'album' && <Album />}
            {item.componentType === 'albumGrid' && <AlbumGrid />}
            {item.componentType === 'albumCarousel' && <AlbumCarousel />}
            {item.componentType === 'ad' && <Ad />}
            {item.componentType === 'adGrid' && <AdGrid />}
            {item.componentType === 'adCarousel' && <AdCarousel />}
            {item.componentType === 'blog' && <Blog />}
            {item.componentType === 'blogGrid' && <BlogGrid />}
            {item.componentType === 'blogCarousel' && <BlogCarousel />}
            {item.componentType === 'chatRoom' && <ChatRoom />}
            {item.componentType === 'chatRoomGrid' && <ChatRoomGrid />}
            {item.componentType === 'chatRoomCarousel' && <ChatRoomCarousel />}
            {item.componentType === 'userProfile' && <UserProfile />}
            {item.componentType === 'userProfileGrid' && <UserProfileGrid />}
            {item.componentType === 'userProfileCarousel' && <UserProfileCarousel />}
            {item.componentType === 'reel' && <Reel />}
            {item.componentType === 'reelGrid' && <ReelGrid />}
            {item.componentType === 'reelCarousel' && <ReelCarousel />}
            {item.componentType === 'story' && <Story />}
            {item.componentType === 'storyGrid' && <StoryGrid />}
            {item.componentType === 'storyCarousel' && <StoryCarousel />}
            {!item.componentType && (
              <span className="page-grid-item-label">{item.label || item.i}</span>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
