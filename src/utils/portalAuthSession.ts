import { setAuthToken } from '../api/config';
import { clearLocalAuthSession } from '@/hooks/api/authSessionActions';
import { type AuthWebStorage } from './authStorage';

/** Clears OAuth tokens + axios bearer (tokens only — no legacy keys). */
export function resetPortalAuthSession(
	storage: AuthWebStorage = localStorage,
	applyAuthToken: (t: string | null) => void = setAuthToken
): void {
	clearLocalAuthSession(storage, applyAuthToken);
}
