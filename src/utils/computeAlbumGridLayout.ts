/**
 * Album grid: choose cols×rows and square tile size (px) from container size.
 * Maximizes items per page (cols*rows) with tile >= minTilePx; on ties prefers larger tiles, then more columns.
 * Resize the container → call again; no dependency on how many albums are on the current page.
 */
export type AlbumGridLayoutOptions = {
	gap: number;
	minTilePx: number;
	maxCols?: number;
	maxRows?: number;
	/** Skip layouts with more slots (still maximizes within this cap). */
	maxItemsPerPage?: number;
};

export type AlbumGridLayout = {
	cols: number;
	rows: number;
	/** Square outer card (width = height) in CSS pixels */
	tilePx: number;
	itemsPerPage: number;
};

export function computeAlbumGridLayout(
	containerW: number,
	containerH: number,
	options: AlbumGridLayoutOptions
): AlbumGridLayout | null {
	const { gap: g, minTilePx, maxCols = 14, maxRows = 12, maxItemsPerPage = 72 } = options;
	const W = containerW;
	const H = containerH;
	if (W <= 0 || H <= 0) return null;

	let best: AlbumGridLayout | null = null;

	for (let c = 1; c <= maxCols; c++) {
		for (let r = 1; r <= maxRows; r++) {
			const cellW = (W - (c - 1) * g) / c;
			const cellH = (H - (r - 1) * g) / r;
			const tilePx = Math.floor(Math.min(cellW, cellH));
			if (tilePx < minTilePx) continue;
			const itemsPerPage = c * r;
			if (itemsPerPage > maxItemsPerPage) continue;
			const ipp = itemsPerPage;
			const better =
				!best ||
				ipp > best.itemsPerPage ||
				(ipp === best.itemsPerPage && tilePx > best.tilePx) ||
				(ipp === best.itemsPerPage && tilePx === best.tilePx && c > best.cols);
			if (better) {
				best = { cols: c, rows: r, tilePx, itemsPerPage };
			}
		}
	}

	if (!best) {
		const s = Math.max(1, Math.floor(Math.min(W, H)));
		return { cols: 1, rows: 1, tilePx: s, itemsPerPage: 1 };
	}
	return best;
}
