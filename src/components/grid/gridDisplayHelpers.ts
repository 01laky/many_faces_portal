/** Stable placeholder image for wall-ticket / ad cards (no image on BE). */
export function wallTicketListingImageUrl(id: number): string {
  return `https://picsum.photos/seed/wt${id}/400/280`;
}

export function albumCoverPlaceholderUrl(albumId: number): string {
  return `https://picsum.photos/seed/album${albumId}/320/320`;
}

export function storyRingImageUrl(storyId: number, coverUrl: string | null): string {
  return coverUrl ?? `https://picsum.photos/seed/storyring${storyId}/200/200`;
}

export function profileAvatarUrl(userId: string, avatarUrl: string | null): string {
  return (
    avatarUrl ??
    `https://picsum.photos/seed/u${Math.abs(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0))}/200/200`
  );
}
