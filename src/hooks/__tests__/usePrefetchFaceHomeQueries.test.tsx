// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrefetchFaceHomeQueries, collectGridTypesForFace } from '../usePrefetchFaceHomeQueries';
import type { FaceConfig } from '@/api/types/facesConfig';

// Minimal face: collectGridTypesForFace only reads pages[].gridSchema; prefetchFaceHome only reads id.
function face(componentTypes: string[], id = 1): FaceConfig {
	return {
		id,
		pages: [
			{ gridSchema: JSON.stringify({ items: componentTypes.map((t) => ({ componentType: t })) }) },
		],
	} as unknown as FaceConfig;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('collectGridTypesForFace', () => {
	it('extracts unique component types from page gridSchemas', () => {
		expect(collectGridTypesForFace(face(['albumGrid', 'albumGrid', 'blogGrid']))).toEqual([
			'albumGrid',
			'blogGrid',
		]);
	});

	it('returns [] for faces with no / invalid gridSchema', () => {
		expect(collectGridTypesForFace({ id: 1, pages: [] } as unknown as FaceConfig)).toEqual([]);
		expect(
			collectGridTypesForFace({
				id: 1,
				pages: [{ gridSchema: 'not-json' }],
			} as unknown as FaceConfig)
		).toEqual([]);
	});
});

describe('usePrefetchFaceHomeQueries inflight guard', () => {
	function setup(token: string | null) {
		const qc = new QueryClient();
		const spy = vi.spyOn(qc, 'prefetchQuery').mockResolvedValue(undefined);
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={qc}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => usePrefetchFaceHomeQueries(token), { wrapper });
		return { spy, result };
	}

	it('does nothing without a token', () => {
		const { spy, result } = setup(null);
		act(() => result.current.prefetchFaceHome(face(['albumGrid'])));
		expect(spy).not.toHaveBeenCalled();
	});

	it('prefetches once and dedups a second call while the first is in flight', () => {
		const { spy, result } = setup('tok');
		const f = face(['albumGrid']);
		act(() => result.current.prefetchFaceHome(f));
		act(() => result.current.prefetchFaceHome(f)); // same face, still in flight → skipped
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('re-warms the same face after the prefetch batch settles (inflightRef reset)', async () => {
		const { spy, result } = setup('tok');
		const f = face(['albumGrid']);
		act(() => result.current.prefetchFaceHome(f));
		expect(spy).toHaveBeenCalledTimes(1);

		await act(async () => {
			await flush(); // lets Promise.allSettled(...).finally clear the in-flight guard
		});

		act(() => result.current.prefetchFaceHome(f));
		expect(spy).toHaveBeenCalledTimes(2);
	});

	it('cancelPrefetch clears the guard immediately so the same face can re-warm', () => {
		const { spy, result } = setup('tok');
		const f = face(['albumGrid']);
		act(() => result.current.prefetchFaceHome(f));
		act(() => result.current.cancelPrefetch());
		act(() => result.current.prefetchFaceHome(f));
		expect(spy).toHaveBeenCalledTimes(2);
	});
});
