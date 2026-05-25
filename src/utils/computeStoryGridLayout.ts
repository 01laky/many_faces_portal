/**
 * Story grid: choose cols×rows and portrait thumb width (1:2 thumb) from container size.
 * Thumb height = 2×thumbW; card height = 2×thumbW + labelPx. Maximizes items per page like album grid.
 */
export type StoryGridLayoutOptions = {
	gap: number;
	/** Minimum thumb width (card width) in CSS pixels */
	minThumbWidthPx: number;
	/** Space reserved below thumb for the name row */
	labelPx: number;
	maxCols?: number;
	maxRows?: number;
	maxItemsPerPage?: number;
};

export type StoryGridLayout = {
	cols: number;
	rows: number;
	/** Card width; thumb area height = 2 × thumbW */
	thumbW: number;
	itemsPerPage: number;
};

export function computeStoryGridLayout(
	containerW: number,
	containerH: number,
	options: StoryGridLayoutOptions
): StoryGridLayout | null {
	const {
		gap: g,
		minThumbWidthPx,
		labelPx,
		maxCols = 14,
		maxRows = 12,
		maxItemsPerPage = 72,
	} = options;
	const W = containerW;
	const H = containerH;
	if (W <= 0 || H <= 0) return null;

	let best: StoryGridLayout | null = null;

	for (let c = 1; c <= maxCols; c++) {
		for (let r = 1; r <= maxRows; r++) {
			const cellW = (W - (c - 1) * g) / c;
			const cellH = (H - (r - 1) * g) / r;
			if (cellH <= labelPx + 2) continue;

			const thumbW = Math.floor(Math.min(cellW, (cellH - labelPx) / 2));
			if (thumbW < minThumbWidthPx) continue;

			const itemsPerPage = c * r;
			if (itemsPerPage > maxItemsPerPage) continue;

			const ipp = itemsPerPage;
			const better =
				!best ||
				ipp > best.itemsPerPage ||
				(ipp === best.itemsPerPage && thumbW > best.thumbW) ||
				(ipp === best.itemsPerPage && thumbW === best.thumbW && c > best.cols);

			if (better) {
				best = { cols: c, rows: r, thumbW, itemsPerPage };
			}
		}
	}

	if (!best) {
		const tw = Math.max(1, Math.floor(Math.min(W, (H - labelPx) / 2)));
		return {
			cols: 1,
			rows: 1,
			thumbW: Math.max(minThumbWidthPx, tw),
			itemsPerPage: 1,
		};
	}

	return best;
}
