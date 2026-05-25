/** GET /api/me/capabilities — mirrors BeDemo.Api.Models.DTOs.CapabilitiesResponse. */
export interface MeCapabilities {
	globalRole: string;
	requestFaceId: number;
	requestFaceIndex: string | null;
	isAdminFaceScope: boolean;
	myFaceRoleName: string | null;
	permissions: string[];
}
