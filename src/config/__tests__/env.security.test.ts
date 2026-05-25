import { describe, expect, it } from 'vitest';
import { collectEnvValidationErrors, DEMO_OAUTH2_CLIENT_SECRET, type EnvConfig } from '../env';

function baseCfg(overrides: Partial<EnvConfig> = {}): EnvConfig {
	return {
		apiUrl: 'https://api.example.com',
		defaultFacePrefix: 'public',
		oauth2ClientId: 'client',
		oauth2ClientSecret: 'secret-prod',
		seqUrl: 'http://localhost:5342',
		enableSeqLogging: true,
		appName: 'Portal',
		appVersion: '1.0.0',
		environment: 'production',
		debugMode: false,
		...overrides,
	};
}

describe('env validation (PSH1-T-E01…E02)', () => {
	it('PSH1-T-E01: prod + http apiUrl fails', () => {
		const errors = collectEnvValidationErrors(baseCfg({ apiUrl: 'http://api.example.com' }), {
			production: true,
		});
		expect(errors.some((e) => e.includes('HTTPS'))).toBe(true);
	});

	it('PSH1-T-E02: demo secret fails in prod', () => {
		const errors = collectEnvValidationErrors(
			baseCfg({ oauth2ClientSecret: DEMO_OAUTH2_CLIENT_SECRET }),
			{ production: true }
		);
		expect(errors.some((e) => e.includes('demo'))).toBe(true);
	});

	it('dev http apiUrl allowed without production flag', () => {
		const errors = collectEnvValidationErrors(baseCfg({ apiUrl: 'http://localhost:8000' }));
		expect(errors.some((e) => e.includes('HTTPS'))).toBe(false);
	});
});
