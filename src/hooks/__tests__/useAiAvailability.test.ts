import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getAiAvailabilityStateForTests,
	mapAiErrorCodeToState,
	resetAiAvailabilityForTests,
	setAiAvailabilityFromErrorCode,
	clearAiAvailabilityDegraded,
	extractAiErrorCodeFromUnknown,
	reportAiError,
} from '@/hooks/useAiAvailability';

describe('useAiAvailability (PT-RP30)', () => {
	beforeEach(() => {
		resetAiAvailabilityForTests();
		vi.useFakeTimers();
	});

	afterEach(() => {
		resetAiAvailabilityForTests();
		vi.useRealTimers();
	});

	it('PT-RP30-U1: ollama_unavailable maps to unavailable', () => {
		expect(mapAiErrorCodeToState('ollama_unavailable')).toBe('unavailable');
		setAiAvailabilityFromErrorCode('ollama_unavailable');
		expect(getAiAvailabilityStateForTests()).toBe('unavailable');
	});

	it('PT-RP30-U2: model_loading maps to loading', () => {
		setAiAvailabilityFromErrorCode('model_loading');
		expect(getAiAvailabilityStateForTests()).toBe('loading');
	});

	it('PT-RP30-U3: circuit open state', () => {
		setAiAvailabilityFromErrorCode('ollama_circuit_open');
		expect(getAiAvailabilityStateForTests()).toBe('circuit_open');
	});

	it('PT-RP30-U4: recovery clears degraded', () => {
		setAiAvailabilityFromErrorCode('generation_failed');
		clearAiAvailabilityDegraded();
		expect(getAiAvailabilityStateForTests()).toBe('available');
	});

	it('reportAiError extracts nested codes', () => {
		reportAiError({ response: { data: { reasonCode: 'ollama_unavailable' } } });
		expect(getAiAvailabilityStateForTests()).toBe('unavailable');
	});

	it('TTL expires to unknown after 60s', () => {
		setAiAvailabilityFromErrorCode('ollama_circuit_open');
		vi.advanceTimersByTime(61_000);
		expect(getAiAvailabilityStateForTests()).toBe('unknown');
	});

	it('unknown codes map to unknown state', () => {
		expect(mapAiErrorCodeToState('prompt_too_long')).toBe('unknown');
	});

	it('extractAiErrorCodeFromUnknown handles errorCode alias', () => {
		expect(
			extractAiErrorCodeFromUnknown({ response: { data: { errorCode: 'model_loading' } } })
		).toBe('model_loading');
	});
});
