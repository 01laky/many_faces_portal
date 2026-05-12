import {
  getCreatorSafeReason,
  getCreatorStatusLabel,
  shouldShowCreatorStatusBadge,
  type AiReviewStatus,
  type ContentApprovalStatus,
} from '../../utils/contentModeration';
import './CreatorModerationBadge.scss';

/** Props mirror the subset of blog/album/reel DTO fields that are safe to show next to creator-owned content. */
interface CreatorModerationBadgeProps {
  approvalStatus?: ContentApprovalStatus | string | null;
  aiReviewStatus?: AiReviewStatus | string | null;
  aiReviewUserMessage?: string | null;
  humanDecisionReason?: string | null;
}

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
