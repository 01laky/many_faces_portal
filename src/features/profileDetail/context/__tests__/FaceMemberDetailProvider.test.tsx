// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { memo } from 'react';
import { render } from '@testing-library/react';
import { FaceMemberDetailProvider } from '../FaceMemberDetailProvider';
import { useFaceMemberDetail } from '../useFaceMemberDetail';
import type { FaceMemberDetailContextValue } from '../faceMemberDetailContext';

/**
 * REF-X2 — provider-value memoisation for `FaceMemberDetailProvider` (portal refactor Phase A §6.10).
 *
 * `FaceProfileDetailPage` builds the member-detail context object inside a `useMemo` (Phase A theme
 * 9) and hands it to this provider. That memo is only worth anything if the provider forwards the
 * object **by identity** — the regression guarded here is someone re-wrapping it inline
 * (`value={{ ...value }}`), which would rebuild the context on every page render and re-render every
 * grid block below it. `React.memo` cannot shield a consumer from context propagation, so a memoised
 * consumer's render count is a direct read-out of whether the identity survived.
 */

let consumerRenders = 0;
let seenValue: FaceMemberDetailContextValue | null = null;

const MemoisedMemberConsumer = memo(function MemoisedMemberConsumer() {
	seenValue = useFaceMemberDetail();
	consumerRenders += 1;
	return null;
});

function makeMemberDetailValue(): FaceMemberDetailContextValue {
	return {
		faceId: 1,
		faceIndex: 'brandx',
		userId: 'user-1',
		detail: {
			userId: 'user-1',
			displayName: 'Member One',
			nickname: null,
			age: null,
			rod: null,
			avatarUrl: null,
			createdAt: '2026-01-01T00:00:00.000Z',
			faceAllowsRecensions: true,
			likedByMe: false,
		},
		comments: [],
		reviews: [],
		token: 'tok',
		isSelf: false,
		refreshAll: () => Promise.resolve(),
	};
}

describe('FaceMemberDetailProvider memoisation REF-X', () => {
	beforeEach(() => {
		consumerRenders = 0;
		seenValue = null;
	});

	it('REF-X2: forwards the memoised value by identity and skips consumer re-renders', () => {
		const value = makeMemberDetailValue();

		const { rerender } = render(
			<FaceMemberDetailProvider value={value}>
				<MemoisedMemberConsumer />
			</FaceMemberDetailProvider>
		);

		expect(consumerRenders).toBe(1);
		// Identity, not a structural copy: the page's useMemo result reaches consumers untouched.
		expect(seenValue).toBe(value);

		rerender(
			<FaceMemberDetailProvider value={value}>
				<MemoisedMemberConsumer />
			</FaceMemberDetailProvider>
		);
		rerender(
			<FaceMemberDetailProvider value={value}>
				<MemoisedMemberConsumer />
			</FaceMemberDetailProvider>
		);

		expect(consumerRenders).toBe(1);
		expect(seenValue).toBe(value);
	});

	it('REF-X2: a new value object still propagates to consumers', () => {
		const value = makeMemberDetailValue();

		const { rerender } = render(
			<FaceMemberDetailProvider value={value}>
				<MemoisedMemberConsumer />
			</FaceMemberDetailProvider>
		);
		expect(consumerRenders).toBe(1);

		// Structurally equal but a different reference — exactly what a lost useMemo would produce.
		const nextValue = makeMemberDetailValue();
		rerender(
			<FaceMemberDetailProvider value={nextValue}>
				<MemoisedMemberConsumer />
			</FaceMemberDetailProvider>
		);

		expect(consumerRenders).toBe(2);
		expect(seenValue).toBe(nextValue);
	});
});
