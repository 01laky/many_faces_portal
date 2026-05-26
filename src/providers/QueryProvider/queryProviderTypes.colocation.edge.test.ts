import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import type { QueryProviderProps } from './types';

describe('QueryProvider colocated props type', () => {
	it('accepts React children', () => {
		const child: ReactNode = 'queries';
		const props: QueryProviderProps = { children: child };
		expect(props.children).toBe('queries');
	});

	it('allows nested provider trees', () => {
		const props: QueryProviderProps = {
			children: { type: 'span', props: { children: 'nested' } } as unknown as ReactNode,
		};
		expect(props.children).toBeTruthy();
	});
});
