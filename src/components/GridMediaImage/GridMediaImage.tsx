import type { ImgHTMLAttributes } from 'react';

type GridMediaImageProps = ImgHTMLAttributes<HTMLImageElement> & {
	priority?: boolean;
};

/** Shared grid thumbnail with lazy/decode hints (PT-RP26). */
export function GridMediaImage({
	priority = false,
	loading,
	decoding,
	...rest
}: GridMediaImageProps) {
	return (
		<img
			loading={loading ?? (priority ? 'eager' : 'lazy')}
			decoding={decoding ?? 'async'}
			{...(priority ? { fetchPriority: 'high' as const } : {})}
			{...rest}
		/>
	);
}
