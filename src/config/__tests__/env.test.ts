/**
 * Pure validation coverage for `collectEnvValidationErrors` — avoids importing the live `env` singleton
 * so tests can craft invalid snapshots without mutating global Vite env.
 */
import { describe, it, expect } from 'vitest';
import { collectEnvValidationErrors } from '../env';
import type { EnvConfig } from '../env';

const base = (): EnvConfig => ({
	apiUrl: 'https://api.example.com',
	defaultFacePrefix: 'public',
	oauth2ClientId: 'id',
	oauth2ClientSecret: 'secret',
	seqUrl: 'https://seq.example.com',
	enableSeqLogging: false,
	appName: 'App',
	appVersion: '1',
	environment: 'test',
	debugMode: false,
});

describe('collectEnvValidationErrors', () => {
	it('accepts valid defaults-shaped config', () => {
		expect(collectEnvValidationErrors(base())).toEqual([]);
	});

	it('flags invalid api URL', () => {
		const cfg = base();
		cfg.apiUrl = 'not a url';
		const e = collectEnvValidationErrors(cfg);
		expect(e.some((m) => m.includes('VITE_API_URL'))).toBe(true);
	});

	it('flags seq URL when logging enabled', () => {
		const cfg = base();
		cfg.enableSeqLogging = true;
		cfg.seqUrl = ':::';
		const e = collectEnvValidationErrors(cfg);
		expect(e.some((m) => m.includes('VITE_SEQ_URL'))).toBe(true);
	});

	it('flags empty OAuth client id or secret', () => {
		const c1 = base();
		c1.oauth2ClientId = '';
		expect(collectEnvValidationErrors(c1)).toContain('VITE_OAUTH2_CLIENT_ID is required');

		const c2 = base();
		c2.oauth2ClientSecret = '';
		expect(collectEnvValidationErrors(c2)).toContain('VITE_OAUTH2_CLIENT_SECRET is required');
	});
});
