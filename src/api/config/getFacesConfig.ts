/**
 * getFacesConfig.ts - Fetch faces configuration from backend
 * 
 * Fetches all faces with their pages configuration before router initialization.
 * This is used by the frontend to dynamically generate routes based on faces and pages.
 */

import axios from 'axios';
import { env } from '../../config/env';
import type { FacesConfigResponse } from '../types/facesConfig';
import { logger } from '../../utils/logger';

/**
 * Fetch faces configuration from backend
 *
 * GET /api/faces/config - Returns all faces with their pages.
 * When token is provided, response includes myFaceRoleId/myFaceRoleName per face.
 *
 * @param token - Optional auth token to include current user's face roles
 * @returns Promise with faces configuration array
 */
export async function getFacesConfig(token?: string | null): Promise<FacesConfigResponse> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get<FacesConfigResponse>(`${env.apiUrl}/api/faces/config`, {
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    const data = response.data || [];
    
    logger.info('Faces config loaded', {
      faceCount: data.length,
      totalPages: data.reduce((sum, face) => sum + face.pages.length, 0),
    });

    return data;
  } catch (error) {
    logger.error('Failed to fetch faces config', { error });
    throw error;
  }
}
