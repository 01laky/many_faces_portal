/**
 * Face roles API - fetch face roles list and set current user's role for a face.
 */

import axios from 'axios';
import { env } from '../../config/env';
import type { FaceRoleOption } from '../types/facesConfig';

/**
 * GET /api/faces/face-roles - list of face-scoped roles for the role selector.
 */
export async function getFaceRoles(): Promise<FaceRoleOption[]> {
	const response = await axios.get<FaceRoleOption[]>(`${env.apiUrl}/api/faces/face-roles`);
	return response.data ?? [];
}

/**
 * PUT /api/faces/{faceId}/my-role - set current user's face role.
 * Requires Authorization header.
 */
export async function setMyFaceRole(
	faceId: number,
	userRoleId: number,
	token: string
): Promise<{ userRoleId: number; userRoleName: string }> {
	const response = await axios.put<{ userRoleId: number; userRoleName: string }>(
		`${env.apiUrl}/api/faces/${faceId}/my-role`,
		{ userRoleId },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return response.data;
}
