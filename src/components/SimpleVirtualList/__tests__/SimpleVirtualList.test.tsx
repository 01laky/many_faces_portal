/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleVirtualList } from '@/components/SimpleVirtualList/SimpleVirtualList';

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({ count }: { count: number }) => ({
		getTotalSize: () => count * 48,
		getVirtualItems: () =>
			Array.from({ length: Math.min(count, 12) }, (_, index) => ({
				index,
				start: index * 48,
				size: 48,
				key: index,
			})),
		measureElement: vi.fn(),
	}),
}));

describe('SimpleVirtualList (PT-RP12)', () => {
	it('PT-RP12-U1: large list renders bounded visible rows', () => {
		const items = Array.from({ length: 500 }, (_, i) => ({ id: i, label: `msg-${i}` }));
		render(
			<SimpleVirtualList
				items={items}
				estimateSize={48}
				className="virtual-thread"
				getKey={(item) => item.id}
				renderItem={(item) => <div data-testid="row">{item.label}</div>}
			/>
		);
		const renderedRows = screen.getAllByTestId('row');
		expect(renderedRows.length).toBeLessThan(100);
		expect(renderedRows.length).toBe(12);
	});

	it('PT-RP12-U3: empty thread renders without crash', () => {
		const { container } = render(
			<SimpleVirtualList
				items={[]}
				getKey={(_, index) => index}
				renderItem={() => <div>empty</div>}
			/>
		);
		expect(container.querySelector('[data-index]')).toBeNull();
	});

	it('PT-RP12-U2: footer anchor renders for scroll-to-bottom hooks', () => {
		render(
			<SimpleVirtualList
				items={[{ id: 1, label: 'one' }]}
				getKey={(item) => item.id}
				renderItem={(item) => <div>{item.label}</div>}
				footer={<div data-testid="thread-footer">end</div>}
			/>
		);
		expect(screen.getByTestId('thread-footer')).toBeTruthy();
	});
});
