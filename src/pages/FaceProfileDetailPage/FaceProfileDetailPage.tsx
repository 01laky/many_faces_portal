import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import {
  fetchFaceProfile,
  fetchFaceProfileComments,
  fetchFaceProfileReviews,
  likeFaceProfile,
  unlikeFaceProfile,
  postFaceProfileComment,
  upsertFaceProfileReview,
  type FaceProfileDetail,
  type FaceProfileCommentRow,
  type FaceProfileReviewRow,
} from '../../api/services/faceProfilesApi';
import './FaceProfileDetailPage.scss';

export function FaceProfileDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation('common');
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  const { token, user } = useAuth();
  const getLocalizedPath = useLocalizedLink();
  const [detail, setDetail] = useState<FaceProfileDetail | null>(null);
  const [comments, setComments] = useState<FaceProfileCommentRow[]>([]);
  const [reviews, setReviews] = useState<FaceProfileReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [revTitle, setRevTitle] = useState('');
  const [revText, setRevText] = useState('');
  const [revStars, setRevStars] = useState(5);

  const uid = userId ? decodeURIComponent(userId) : '';

  const load = useCallback(async () => {
    await Promise.resolve();
    if (!selectedFace || !uid) return;
    setLoading(true);
    try {
      const d = await fetchFaceProfile(selectedFace.id, uid, token ?? undefined);
      setDetail(d);
      const c = await fetchFaceProfileComments(selectedFace.id, uid, token ?? undefined);
      setComments(c);
      const r = await fetchFaceProfileReviews(selectedFace.id, uid, token ?? undefined);
      setReviews(r);
    } catch {
      toast.error(t('faceProfiles.loadError'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [selectedFace, uid, token, t]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await load();
    })();
  }, [load]);

  const handleLike = async () => {
    if (!token || !selectedFace || !detail) return;
    try {
      if (detail.likedByMe) await unlikeFaceProfile(selectedFace.id, uid, token);
      else await likeFaceProfile(selectedFace.id, uid, token);
      await load();
    } catch {
      toast.error(t('faceProfiles.likeError'));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedFace || !commentBody.trim()) return;
    try {
      await postFaceProfileComment(selectedFace.id, uid, commentBody.trim(), token);
      setCommentBody('');
      await load();
    } catch {
      toast.error(t('faceProfiles.commentError'));
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedFace || !revTitle.trim() || !revText.trim()) return;
    try {
      await upsertFaceProfileReview(
        selectedFace.id,
        uid,
        { title: revTitle.trim(), text: revText.trim(), stars: revStars },
        token
      );
      setRevTitle('');
      setRevText('');
      await load();
    } catch {
      toast.error(t('faceProfiles.reviewError'));
    }
  };

  if (!selectedFace || !uid) return null;

  const listPath = `/${selectedFace.index}/profiles`;
  const isSelf = user?.id === uid;

  return (
    <div className="face-profile-detail-page">
      <div className="face-profile-detail-page__header">
        <Link to={getLocalizedPath(listPath)} className="face-profile-detail-page__back">
          <ArrowLeft size={20} />
          {t('faceProfiles.backToList')}
        </Link>
        <Link to={getLocalizedPath(getFaceHomePath())} className="face-profile-detail-page__back">
          {t('faceProfiles.backHome')}
        </Link>
      </div>

      {loading && <p>{t('faceProfiles.loading')}</p>}

      {!loading && detail && (
        <>
          <div className="face-profile-detail-page__hero">
            <div className="face-profile-detail-page__avatar">
              {detail.avatarUrl ? (
                <img src={detail.avatarUrl} alt="" />
              ) : (
                <UserCircle size={96} strokeWidth={1.25} />
              )}
            </div>
            <h1>{detail.displayName || detail.nickname || uid}</h1>
            <dl className="face-profile-detail-page__meta">
              <div>
                <dt>{t('faceProfiles.nickname')}</dt>
                <dd>{detail.nickname ?? '—'}</dd>
              </div>
              <div>
                <dt>{t('faceProfiles.age')}</dt>
                <dd>{detail.age ?? '—'}</dd>
              </div>
              <div>
                <dt>{t('faceProfiles.rod')}</dt>
                <dd>{detail.rod ?? '—'}</dd>
              </div>
              <div>
                <dt>{t('faceProfiles.created')}</dt>
                <dd>{new Date(detail.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
            {token && !isSelf && (
              <button
                type="button"
                className="face-profile-detail-page__like"
                onClick={() => void handleLike()}
              >
                {detail.likedByMe ? t('faceProfiles.unlike') : t('faceProfiles.like')}
              </button>
            )}
          </div>

          <section className="face-profile-detail-page__section">
            <h2>{t('faceProfiles.comments')}</h2>
            <ul className="face-profile-detail-page__comments">
              {comments.map((c) => (
                <li key={c.id}>
                  <strong>{c.userId.slice(0, 8)}</strong>
                  <span className="face-profile-detail-page__comment-time">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <p>{c.body}</p>
                </li>
              ))}
            </ul>
            {token && !isSelf && (
              <form
                onSubmit={(e) => void handleComment(e)}
                className="face-profile-detail-page__comment-form"
              >
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder={t('faceProfiles.commentPlaceholder')}
                  rows={3}
                />
                <button type="submit">{t('faceProfiles.send')}</button>
              </form>
            )}
          </section>

          <section className="face-profile-detail-page__section">
            <h2>{t('faceProfiles.reviews')}</h2>
            {!detail.faceAllowsRecensions && (
              <p className="face-profile-detail-page__muted">
                {t('faceProfiles.recensionsDisabled')}
              </p>
            )}
            {detail.faceAllowsRecensions && reviews.length === 0 && (
              <p className="face-profile-detail-page__muted">{t('faceProfiles.noReviews')}</p>
            )}
            {detail.faceAllowsRecensions &&
              reviews.map((r) => (
                <article key={r.id} className="face-profile-detail-page__review">
                  <h3>{r.title}</h3>
                  <p
                    className="face-profile-detail-page__stars"
                    aria-label={t('faceProfiles.starsOfSix', { count: r.stars })}
                  >
                    {'★'.repeat(r.stars)}
                    <span className="face-profile-detail-page__stars-muted"> ({r.stars}/6)</span>
                  </p>
                  <p>{r.text}</p>
                </article>
              ))}
            {token && !isSelf && detail.faceAllowsRecensions && (
              <form
                onSubmit={(e) => void handleReview(e)}
                className="face-profile-detail-page__review-form"
              >
                <input
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder={t('faceProfiles.reviewTitle')}
                />
                <textarea
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                  placeholder={t('faceProfiles.reviewText')}
                  rows={4}
                />
                <label>
                  {t('faceProfiles.starsLabel')}
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={revStars}
                    onChange={(e) => setRevStars(Number(e.target.value))}
                  />
                </label>
                <button type="submit">{t('faceProfiles.submitReview')}</button>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
}
