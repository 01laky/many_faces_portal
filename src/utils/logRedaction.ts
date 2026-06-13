const SENSITIVE_KEY = /token|password|secret|refresh|authorization|credential|livekit|turn/i;
// Token-bearing patterns embedded in a free-text message or URL (not just an `access_token` query param).
const SENSITIVE_QUERY = /((?:access_token|refresh_token|id_token|token|api[_-]?key)=)[^&\s]+/gi;
const BEARER_TOKEN = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
// Guard against runaway recursion / accidental cycles in log payloads.
const MAX_DEPTH = 6;

export function redactSensitiveLogText(value: string): string {
	return value.replace(SENSITIVE_QUERY, '$1[REDACTED]').replace(BEARER_TOKEN, 'Bearer [REDACTED]');
}

function redactValue(val: unknown, depth: number): unknown {
	if (typeof val === 'string') return redactSensitiveLogText(val);
	if (depth >= MAX_DEPTH) return val;
	if (Array.isArray(val)) return val.map((item) => redactValue(item, depth + 1));
	if (val && typeof val === 'object')
		return redactObject(val as Record<string, unknown>, depth + 1);
	return val;
}

function redactObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, val] of Object.entries(obj)) {
		// A sensitive key is redacted whole — at any nesting level (e.g. { headers: { authorization } }).
		if (SENSITIVE_KEY.test(key)) {
			out[key] = '[REDACTED]';
			continue;
		}
		out[key] = redactValue(val, depth);
	}
	return out;
}

export function redactLogProperties(
	properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
	if (!properties) return properties;
	return redactObject(properties, 0);
}
