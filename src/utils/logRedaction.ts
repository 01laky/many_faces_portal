const SENSITIVE_KEY = /token|password|secret|refresh|authorization|credential|livekit|turn/i;
const ACCESS_TOKEN_QUERY = /access_token=[^&\s]+/gi;

export function redactSensitiveLogText(value: string): string {
	return value.replace(ACCESS_TOKEN_QUERY, 'access_token=[REDACTED]');
}

export function redactLogProperties(
	properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
	if (!properties) return properties;

	const out: Record<string, unknown> = {};
	for (const [key, val] of Object.entries(properties)) {
		if (SENSITIVE_KEY.test(key)) {
			out[key] = '[REDACTED]';
			continue;
		}
		if (typeof val === 'string') out[key] = redactSensitiveLogText(val);
		else out[key] = val;
	}
	return out;
}
