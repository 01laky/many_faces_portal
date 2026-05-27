import { useEffect, useRef, useState } from 'react';

/**
 * Returns true once the ref element intersects the viewport (PT-RP16).
 * In test env without IntersectionObserver, defaults to true so grids still fetch.
 */
export function useInViewOnce(rootMargin = '120px'): {
	ref: (node: HTMLElement | null) => void;
	inView: boolean;
} {
	const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
	const observerRef = useRef<IntersectionObserver | null>(null);
	const elementRef = useRef<HTMLElement | null>(null);

	const ref = (node: HTMLElement | null) => {
		elementRef.current = node;
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}
		if (!node || typeof IntersectionObserver === 'undefined') {
			if (typeof IntersectionObserver === 'undefined') setInView(true);
			return;
		}
		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setInView(true);
					observerRef.current?.disconnect();
				}
			},
			{ rootMargin, threshold: 0.01 }
		);
		observerRef.current.observe(node);
	};

	useEffect(
		() => () => {
			observerRef.current?.disconnect();
		},
		[]
	);

	return { ref, inView };
}
