/** Query string for reel APIs that scope by current face (optional). */
export function buildFaceQuery(faceId?: number): string {
	return faceId != null ? `?faceId=${faceId}` : '';
}
