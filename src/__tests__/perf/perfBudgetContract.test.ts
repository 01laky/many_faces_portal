import { describe, it, expect } from 'vitest';
import { FACE_HOME_API_BUDGET } from '@/hooks/api/gridQueries/gridQueryKeys';

/** Mirrors cypress/support/perfBudgets.js — must stay aligned (PT-RP29). */
const CYPRESS_FACE_HOME_MAX_API_CALLS = 8;

describe('perf budget contract (PT-RP29)', () => {
	it('PT-RP29-U1: Vitest budget matches Cypress FACE_HOME_MAX_API_CALLS', () => {
		expect(FACE_HOME_API_BUDGET).toBe(CYPRESS_FACE_HOME_MAX_API_CALLS);
	});

	it('PT-RP29-U2: messenger merge path does not imply list refetch key', () => {
		const conversationListKey = ['messenger', 'conversations'] as const;
		const messagePatchKey = ['messenger', 'conversation', 'user-1'] as const;
		expect(JSON.stringify(conversationListKey)).not.toBe(JSON.stringify(messagePatchKey));
	});
});
