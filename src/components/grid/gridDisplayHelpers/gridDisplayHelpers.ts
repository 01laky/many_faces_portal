function neutralSvgDataUri(label: string, width: number, height: number): string {
	const safeLabel = label.replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			case "'":
				return '&apos;';
			default:
				return ch;
		}
	});
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safeLabel}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eef2ff"/><stop offset="100%" stop-color="#dbeafe"/></linearGradient></defs><rect width="100%" height="100%" rx="18" fill="url(#g)"/><circle cx="${width / 2}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.13}" fill="#94a3b8" opacity="0.7"/><text x="50%" y="68%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(12, Math.round(width / 13))}" fill="#475569">${safeLabel}</text></svg>`;
	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Neutral placeholder image for wall-ticket / ad cards when BE has no media URL. */
export function wallTicketListingImageUrl(_id: number): string {
	return neutralSvgDataUri('No listing image', 400, 280);
}

export function albumCoverPlaceholderUrl(_albumId: number): string {
	return neutralSvgDataUri('No album cover', 320, 320);
}

export function albumThumbnailPlaceholderUrl(_albumId: number, index: number): string {
	return neutralSvgDataUri(`Photo ${index + 1}`, 150, 150);
}

export function blogCoverPlaceholderUrl(): string {
	return neutralSvgDataUri('No blog image', 600, 400);
}

export function storyRingImageUrl(_storyId: number, coverUrl: string | null): string {
	return coverUrl ?? neutralSvgDataUri('Story', 200, 200);
}

export function profileAvatarUrl(userId: string, avatarUrl: string | null): string {
	if (avatarUrl) return avatarUrl;
	const initials = userId
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
	return neutralSvgDataUri(initials || 'Member', 200, 200);
}
