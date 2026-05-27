/* eslint-disable react-refresh/only-export-components -- PT-RP27 test helpers + lazy host gate */
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';

const LazyToastContainer = lazy(async () => {
	const [{ ToastContainer }, css] = await Promise.all([
		import('react-toastify'),
		import('react-toastify/dist/ReactToastify.css'),
	]);
	void css;
	return { default: ToastContainer };
});

let hostMounted = false;

/** Defer toast CSS + container until first toast (PT-RP27). */
export function ensureToastHost(): void {
	if (hostMounted || typeof document === 'undefined') return;
	hostMounted = true;
}

export function ToastHost(): ReactNode {
	const [visible, setVisible] = useState(hostMounted);

	useEffect(() => {
		if (hostMounted) {
			queueMicrotask(() => setVisible(true));
			return;
		}
		const onFirstToast = () => {
			hostMounted = true;
			setVisible(true);
		};
		// Patch toast to mount host on first call
		void import('react-toastify').then(({ toast }) => {
			const orig = toast as typeof toast & { __patched?: boolean };
			if (orig.__patched) return;
			const wrap =
				(fn: (...args: unknown[]) => unknown) =>
				(...args: unknown[]) => {
					onFirstToast();
					return fn(...args);
				};
			(['success', 'error', 'info', 'warn', 'warning', 'dark'] as const).forEach((k) => {
				const method = toast[k];
				if (typeof method === 'function') {
					(toast as unknown as Record<string, unknown>)[k] = wrap(
						method as (...args: unknown[]) => unknown
					);
				}
			});
			orig.__patched = true;
		});
	}, []);

	if (!visible) return null;

	return (
		<Suspense fallback={null}>
			<LazyToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
		</Suspense>
	);
}

export function resetToastHostForTests(): void {
	hostMounted = false;
}
