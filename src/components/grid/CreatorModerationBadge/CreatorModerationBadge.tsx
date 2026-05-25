import {
	getCreatorSafeReason,
	getCreatorStatusLabel,
	shouldShowCreatorStatusBadge,
} from '../../../utils/contentModeration';
import './CreatorModerationBadge.scss';
import type { CreatorModerationBadgeProps } from './types';

/**
 * Inline badge for grids/cards where the viewer owns non-approved content.
 * Tooltip prefers the safe user-facing reason; falls back to the status label.
 */
export function CreatorModerationBadge({
	approvalStatus,
	aiReviewStatus,
	aiReviewUserMessage,
	humanDecisionReason,
}: CreatorModerationBadgeProps) {
	if (!shouldShowCreatorStatusBadge(approvalStatus)) return null;

	const label = getCreatorStatusLabel(approvalStatus, aiReviewStatus);
	const reason = getCreatorSafeReason(aiReviewUserMessage, humanDecisionReason);

	return (
		<span className="creator-moderation-badge" title={reason ?? label}>
			{label}
		</span>
	);
}
