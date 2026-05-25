export interface PortalJwtUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const binary = atob(base64);
		const json = decodeURIComponent(
			binary
				.split('')
				.map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join('')
		);
		return JSON.parse(json) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function readStringClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
	for (const key of keys) {
		const v = payload[key];
		if (typeof v === 'string' && v.length > 0) return v;
	}
	return undefined;
}

/** Derive portal user display fields from access JWT (no localStorage persistence). */
export function jwtUserFromToken(
	token: string | null | undefined,
	fallbackUsername?: string
): PortalJwtUser | null {
	if (!token) return null;
	const payload = decodeJwtPayload(token);
	if (!payload) return null;

	const id = readStringClaim(payload, 'sub', 'nameid') ?? fallbackUsername ?? '';
	const email = readStringClaim(payload, 'email') ?? fallbackUsername ?? id;
	if (!id && !email) return null;

	return {
		id: id || email,
		email,
		firstName: readStringClaim(payload, 'given_name', 'firstName'),
		lastName: readStringClaim(payload, 'family_name', 'lastName'),
	};
}
