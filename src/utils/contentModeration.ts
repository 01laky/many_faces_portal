/**
 * Creator-facing helpers for the user content moderation workflow (Many Faces AI demo).
 *
 * These utilities mirror backend rules only where safe: they format labels, group lists for UI,
 * and gate edit/delete affordances. They must never reconstruct hidden AI diagnostics.
 */
export type ContentApprovalStatus = 'PendingApproval' | 'Approved' | 'Rejected' | 'Removed';

export type AiReviewStatus =
	| 'NotQueued'
	| 'Queued'
	| 'InProgress'
	| 'RecommendedApprove'
	| 'RecommendedReject'
	| 'NeedsHumanReview'
	| 'Failed';

export type ModeratedContentType = 'Album' | 'Blog' | 'Reel';

export interface MyContentSubmission {
	contentType: ModeratedContentType;
	contentId: number;
	title: string;
	faceId: number;
	faceTitle: string;
	approvalStatus: ContentApprovalStatus;
	aiReviewStatus: AiReviewStatus;
	creatorStatusLabel: string;
	aiReviewUserMessage?: string | null;
	humanDecisionReason?: string | null;
	submittedAtUtc?: string | null;
	updatedAt?: string | null;
	createdAt: string;
	canEdit: boolean;
	canDelete: boolean;
}

/** Maps raw API status fields to a short string shown on creator badges and submission cards. */
export function getCreatorStatusLabel(
	approvalStatus?: ContentApprovalStatus | string | null,
	aiReviewStatus?: AiReviewStatus | string | null
) {
	if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'InProgress') {
		return 'Under AI review';
	}
	if (approvalStatus === 'PendingApproval' && aiReviewStatus === 'NeedsHumanReview') {
		return 'Needs review';
	}

	switch (approvalStatus) {
		case 'PendingApproval':
			return 'Pending approval';
		case 'Approved':
			return 'Approved';
		case 'Rejected':
			return 'Rejected';
		case 'Removed':
			return 'Removed';
		default:
			return 'Pending approval';
	}
}

/** Toast / inline copy after a successful create while the item is still pending approval. */
export function getSubmittedForApprovalCopy(contentType: 'album' | 'blog' | 'reel') {
	const label = contentType.charAt(0).toUpperCase() + contentType.slice(1);
	return `${label} submitted for approval. Your content was created and is waiting for review.`;
}

/** Hides badges once content is approved so public pages stay visually calm. */
export function shouldShowCreatorStatusBadge(
	approvalStatus?: ContentApprovalStatus | string | null
) {
	return Boolean(approvalStatus && approvalStatus !== 'Approved');
}

/**
 * Picks the first creator-safe explanation: prefer AI user message, else human reason.
 * Truncates to avoid dumping long internal text into cards.
 */
export function getCreatorSafeReason(
	aiReviewUserMessage?: string | null,
	humanDecisionReason?: string | null
) {
	const message = aiReviewUserMessage?.trim() || humanDecisionReason?.trim();
	if (!message) return null;
	return message.length <= 240 ? message : `${message.slice(0, 240)}...`;
}

export type SubmissionGroupKey =
	| 'pendingApproval'
	| 'underAiReview'
	| 'needsReview'
	| 'approved'
	| 'rejected'
	| 'removed';

export const SUBMISSION_GROUP_LABELS: Record<SubmissionGroupKey, string> = {
	pendingApproval: 'Pending approval',
	underAiReview: 'Under AI review',
	needsReview: 'Needs review',
	approved: 'Approved',
	rejected: 'Rejected',
	removed: 'Removed',
};

/**
 * Derives a stable bucket key for the "My submissions" page. Order matters: terminal approval states win
 * before AI sub-states so removed/rejected never appear as "pending".
 */
export function getSubmissionGroupKey(
	approvalStatus: ContentApprovalStatus,
	aiReviewStatus: AiReviewStatus
): SubmissionGroupKey {
	if (approvalStatus === 'Removed') return 'removed';
	if (approvalStatus === 'Rejected') return 'rejected';
	if (approvalStatus === 'Approved') return 'approved';
	if (aiReviewStatus === 'InProgress' || aiReviewStatus === 'Queued') return 'underAiReview';
	if (aiReviewStatus === 'NeedsHumanReview' || aiReviewStatus === 'Failed') return 'needsReview';
	return 'pendingApproval';
}

/** Splits the flat API array into the sections rendered on `/my-submissions`. */
export function groupSubmissionsByStatus(items: MyContentSubmission[]) {
	return items.reduce<Record<SubmissionGroupKey, MyContentSubmission[]>>(
		(groups, item) => {
			groups[getSubmissionGroupKey(item.approvalStatus, item.aiReviewStatus)].push(item);
			return groups;
		},
		{
			pendingApproval: [],
			underAiReview: [],
			needsReview: [],
			approved: [],
			rejected: [],
			removed: [],
		}
	);
}

/** Mirrors backend creator edit policy (pending or rejected only). */
export function isCreatorModerationEditAllowed(
	approvalStatus?: ContentApprovalStatus | string | null
): boolean {
	return approvalStatus === 'PendingApproval' || approvalStatus === 'Rejected';
}

export function isCreatorModerationDeleteAllowed(
	approvalStatus?: ContentApprovalStatus | string | null
): boolean {
	return isCreatorModerationEditAllowed(approvalStatus);
}

export function canOwnerUseModerationEditorActions(
	isOwner: boolean,
	approvalStatus?: ContentApprovalStatus | string | null
): boolean {
	return Boolean(isOwner && isCreatorModerationEditAllowed(approvalStatus));
}

/**
 * Builds a language-scoped relative router path from `/my-submissions` to a detail route.
 * `openEditor` appends `?edit=1` so detail pages can auto-open the edit panel for allowed creators.
 */
export function buildMySubmissionDetailRelativePath(
	contentType: string,
	contentId: number,
	options?: { openEditor?: boolean }
): string {
	const base = `../${contentType.toLowerCase()}/${contentId}`;
	if (options?.openEditor) return `${base}?edit=1`;
	return base;
}
