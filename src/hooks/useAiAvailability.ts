import { useCallback, useEffect, useState } from 'react';

export type AiAvailabilityState =
	| 'available'
	| 'loading'
	| 'unavailable'
	| 'circuit_open'
	| 'unknown';

const DEGRADED_TTL_MS = 60_000;

let globalAiState: AiAvailabilityState = 'unknown';
let globalAiExpiresAt = 0;
const listeners = new Set<(s: AiAvailabilityState) => void>();

function notify() {
	for (const l of listeners) l(globalAiState);
}

/** Map backend/worker error codes to portal UX state (PT-RP30). */
export function mapAiErrorCodeToState(code: string | null | undefined): AiAvailabilityState {
	if (!code) return 'unknown';
	const c = code.toLowerCase();
	if (c === 'model_loading') return 'loading';
	if (c === 'ollama_circuit_open') return 'circuit_open';
	if (c === 'ollama_unavailable' || c === 'generation_failed') return 'unavailable';
	return 'unknown';
}

export function setAiAvailabilityFromErrorCode(code: string | null | undefined): void {
	const next = mapAiErrorCodeToState(code);
	globalAiState = next;
	globalAiExpiresAt = Date.now() + DEGRADED_TTL_MS;
	notify();
}

export function clearAiAvailabilityDegraded(): void {
	globalAiState = 'available';
	globalAiExpiresAt = 0;
	notify();
}

export function getAiAvailabilityStateForTests(): AiAvailabilityState {
	if (globalAiExpiresAt > 0 && Date.now() > globalAiExpiresAt) {
		globalAiState = 'unknown';
		globalAiExpiresAt = 0;
	}
	return globalAiState;
}

export function resetAiAvailabilityForTests(): void {
	globalAiState = 'unknown';
	globalAiExpiresAt = 0;
	listeners.clear();
}

/** Subscribe to AI degraded state for banner + feature gates (PT-RP30). */
export function useAiAvailability(): {
	state: AiAvailabilityState;
	isDegraded: boolean;
	retryProbe: () => void;
} {
	const [state, setState] = useState<AiAvailabilityState>(() => getAiAvailabilityStateForTests());

	useEffect(() => {
		const tick = () => setState(getAiAvailabilityStateForTests());
		listeners.add(tick);
		return () => {
			listeners.delete(tick);
		};
	}, []);

	const retryProbe = useCallback(() => {
		clearAiAvailabilityDegraded();
	}, []);

	const isDegraded = state === 'unavailable' || state === 'circuit_open' || state === 'loading';

	return { state, isDegraded, retryProbe };
}

/** Parse axios/fetch error payloads for AI error_code. */
export function extractAiErrorCodeFromUnknown(err: unknown): string | null {
	if (!err || typeof err !== 'object') return null;
	const o = err as Record<string, unknown>;
	const response = o.response as Record<string, unknown> | undefined;
	const data = response?.data as Record<string, unknown> | undefined;
	const code = data?.error_code ?? data?.errorCode ?? data?.reasonCode;
	return typeof code === 'string' ? code : null;
}

export function reportAiError(err: unknown): void {
	const code = extractAiErrorCodeFromUnknown(err);
	if (code) setAiAvailabilityFromErrorCode(code);
}
