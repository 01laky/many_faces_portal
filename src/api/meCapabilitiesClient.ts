import axios from 'axios';
import { env } from '../config/env';
import { parseMeCapabilities } from '../acl/permissions';
import type { MeCapabilities } from '../acl/capabilitiesTypes';

export async function fetchMeCapabilities(token: string): Promise<MeCapabilities | null> {
	const { data } = await axios.get<unknown>(`${env.apiUrl}/api/me/capabilities`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return parseMeCapabilities(data);
}
