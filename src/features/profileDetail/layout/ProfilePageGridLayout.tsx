import { useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { renderProfileDetailSection } from '../registry/profileDetailSectionRegistry';
import type { ProfileDetailGridSchema } from '../schema/profileDetailGridTypes';
import './ProfilePageGridLayout.scss';

interface ProfilePageGridLayoutProps {
	schema: ProfileDetailGridSchema;
}

export function ProfilePageGridLayout({ schema }: ProfilePageGridLayoutProps) {
	const { width, containerRef } = useContainerWidth();

	const layouts = useMemo<ResponsiveLayouts>(() => {
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
	}, [schema.items]);

	return (
		<div ref={containerRef} className="profile-page-grid-layout">
			{width > 0 && (
				<ResponsiveGridLayout
					className="profile-page-grid-layout__grid"
					width={width}
					layouts={layouts}
					breakpoints={schema.breakpoints}
					cols={schema.cols}
					rowHeight={schema.rowHeight}
					compactor={verticalCompactor}
					dragConfig={{ enabled: false }}
					resizeConfig={{ enabled: false }}
					margin={[16, 16]}
					containerPadding={[0, 0]}
				>
					{schema.items.map((item) => (
						<div key={item.i} className="profile-page-grid-layout__cell">
							{renderProfileDetailSection(item)}
						</div>
					))}
				</ResponsiveGridLayout>
			)}
		</div>
	);
}
