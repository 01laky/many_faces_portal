import type { AiReviewStatus, ContentApprovalStatus } from '../../../utils/contentModeration';

/** Props mirror the subset of blog/album/reel DTO fields that are safe to show next to creator-owned content. */
export interface CreatorModerationBadgeProps {
	approvalStatus?: ContentApprovalStatus | string | null;
	aiReviewStatus?: AiReviewStatus | string | null;
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
}
