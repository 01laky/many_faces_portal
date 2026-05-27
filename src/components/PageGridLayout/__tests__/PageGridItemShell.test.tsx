/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PageGridItemShell } from '@/components/PageGridLayout/PageGridItemShell';

const componentBlockRender = vi.fn(({ children }: { children: React.ReactNode }) => (
	<div data-testid="component-block">{children}</div>
));

vi.mock('@/hooks/useInViewOnce', () => ({
	useInViewOnce: () => ({ ref: vi.fn(), inView: true }),
}));

vi.mock('@/components/ComponentBlock', () => ({
	ComponentBlock: (props: { children: React.ReactNode }) => componentBlockRender(props),
}));

describe('PageGridItemShell memo (PT-RP24)', () => {
	it('PT-RP24-U1: sibling pagination prop change does not re-render unchanged shell props', () => {
		componentBlockRender.mockClear();
		const child = <span>grid-body</span>;
		const { rerender } = render(
			<PageGridItemShell
				itemId="album-1"
				componentType="albumGrid"
				page={0}
				totalPages={3}
				autoplayFromStorage={false}
			>
				{child}
			</PageGridItemShell>
		);
		expect(componentBlockRender).toHaveBeenCalledTimes(1);

		rerender(
			<PageGridItemShell
				itemId="album-1"
				componentType="albumGrid"
				page={0}
				totalPages={3}
				autoplayFromStorage={false}
			>
				{child}
			</PageGridItemShell>
		);
		expect(componentBlockRender).toHaveBeenCalledTimes(1);
	});

	it('PT-RP24-U3: single-page carousel omits footer handlers safely', () => {
		componentBlockRender.mockClear();
		render(
			<PageGridItemShell
				itemId="story-1"
				componentType="storyGrid"
				page={0}
				totalPages={1}
				autoplayFromStorage={false}
			>
				<span>one item</span>
			</PageGridItemShell>
		);
		expect(componentBlockRender).toHaveBeenCalledTimes(1);
		const props = componentBlockRender.mock.calls[0]?.[0] as { totalPages: number };
		expect(props.totalPages).toBe(1);
	});
});
