import { Link } from 'react-router-dom';
import { useMyContentSubmissions } from '../../hooks/api/useMyContentSubmissionsApi';
import {
  SUBMISSION_GROUP_LABELS,
  getCreatorSafeReason,
  groupSubmissionsByStatus,
  buildMySubmissionDetailRelativePath,
  type SubmissionGroupKey,
} from '../../utils/contentModeration';
import './MySubmissionsPage.scss';

/**
 * Creator dashboard: lists moderated user content grouped by approval/AI state with deep links to detail routes.
 */
const GROUP_ORDER: SubmissionGroupKey[] = [
  'underAiReview',
  'pendingApproval',
  'needsReview',
  'rejected',
  'approved',
  'removed',
];

export function MySubmissionsPage() {
  const { data, isLoading, error } = useMyContentSubmissions();
  const grouped = groupSubmissionsByStatus(data ?? []);

  return (
    <main className="my-submissions-page">
      {isLoading && <p>Loading submissions...</p>}
      {error && <p role="alert">Failed to load your submissions.</p>}
      {!isLoading && !error && (data ?? []).length === 0 && (
        <section className="my-submissions-page__empty">
          <h2>No submissions yet</h2>
          <p>
            Create an album, blog or reel and it will appear here while it moves through review.
          </p>
        </section>
      )}

      {GROUP_ORDER.map((groupKey) => {
        const items = grouped[groupKey];
        if (items.length === 0) return null;
        return (
          <section key={groupKey} className="my-submissions-page__group">
            <h2>{SUBMISSION_GROUP_LABELS[groupKey]}</h2>
            <div className="my-submissions-page__cards">
              {items.map((item) => {
                const reason = getCreatorSafeReason(
                  item.aiReviewUserMessage,
                  item.humanDecisionReason
                );
                return (
                  <article
                    key={`${item.contentType}:${item.contentId}`}
                    className="my-submissions-page__card"
                  >
                    <div className="my-submissions-page__card-top">
                      <span>{item.contentType}</span>
                      <strong>{item.creatorStatusLabel}</strong>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.faceTitle || `Face #${item.faceId}`}</p>
                    {reason && <p className="my-submissions-page__reason">{reason}</p>}
                    <p className="my-submissions-page__date">
                      Submitted{' '}
                      {item.submittedAtUtc
                        ? new Date(item.submittedAtUtc).toLocaleString()
                        : 'date not available'}
                    </p>
                    <div className="my-submissions-page__actions">
                      <Link
                        to={buildMySubmissionDetailRelativePath(item.contentType, item.contentId)}
                      >
                        View
                      </Link>
                      {item.canEdit && (
                        <Link
                          to={buildMySubmissionDetailRelativePath(
                            item.contentType,
                            item.contentId,
                            {
                              openEditor: true,
                            }
                          )}
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
