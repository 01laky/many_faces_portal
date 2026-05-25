import { authAwareFetch } from '../utils/authAwareFetch';
import { absoluteScopedUrl } from '../faceApiRouting';

async function apiFetch(path: string, options: RequestInit & { token?: string }) {
	const token = options.token;
	delete (options as Record<string, unknown>).token;
	const url = absoluteScopedUrl(path);
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) ?? {}),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return authAwareFetch(url, { ...options, headers, token: token ?? undefined });
}

export interface UserListItem {
	id: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	createdAt: string;
}

export interface GetUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	forAddFriend?: boolean;
}

export interface GetUsersResponse {
	items: UserListItem[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function getUsers(token: string, params?: GetUsersParams): Promise<GetUsersResponse> {
	const sp = new URLSearchParams();
	if (params?.page != null) sp.set('page', String(params.page));
	if (params?.pageSize != null) sp.set('pageSize', String(params.pageSize));
	if (params?.search?.trim()) sp.set('search', params.search.trim());
	if (params?.forAddFriend) sp.set('forAddFriend', 'true');
	const query = sp.toString();
	const url = query ? `/api/Users?${query}` : '/api/Users';
	const res = await apiFetch(url, { method: 'GET', token });
	if (!res.ok) throw new Error('Failed to fetch users');
	return res.json();
}

export async function getUser(id: string, token: string): Promise<UserListItem | null> {
	const res = await apiFetch(`/api/Users/${encodeURIComponent(id)}`, { method: 'GET', token });
	if (res.status === 404) return null;
	if (!res.ok) throw new Error('Failed to fetch user');
	return res.json();
}
