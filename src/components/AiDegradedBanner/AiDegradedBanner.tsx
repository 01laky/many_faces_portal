import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useAiAvailability } from '@/hooks/useAiAvailability';
import './AiDegradedBanner.scss';

/** Non-blocking AI degraded banner (PT-RP30). */
export function AiDegradedBanner() {
	const { t } = useTranslation('common');
	const { state, isDegraded, retryProbe } = useAiAvailability();

	if (!isDegraded) return null;

	const messageKey =
		state === 'loading'
			? 'ai.degraded.loading'
			: state === 'circuit_open'
				? 'ai.degraded.circuitOpen'
				: 'ai.degraded.unavailable';

	return (
		<div className="ai-degraded-banner" role="status" data-testid="ai-degraded-banner">
			{state === 'loading' ? <Loader2 size={18} className="spin" /> : <AlertTriangle size={18} />}
			<span>
				{t(messageKey, 'AI features are temporarily limited. Core browsing still works.')}
			</span>
			<button type="button" className="ai-degraded-banner__retry" onClick={retryProbe}>
				<RefreshCw size={14} />
				{t('ai.degraded.retry', 'Retry')}
			</button>
		</div>
	);
}
