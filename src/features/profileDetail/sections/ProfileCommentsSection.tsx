import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { postFaceProfileComment } from '../../../api/services/faceProfilesApi';
import { useFaceMemberDetail } from '../context/useFaceMemberDetail';

export function ProfileCommentsSection() {
  const { t } = useTranslation('common');
  const { faceId, userId, comments, token, isSelf, refreshAll } = useFaceMemberDetail();
  const [commentBody, setCommentBody] = useState('');

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !commentBody.trim()) return;
    try {
      await postFaceProfileComment(faceId, userId, commentBody.trim(), token);
      setCommentBody('');
      await refreshAll();
    } catch {
      toast.error(t('faceProfiles.commentError'));
    }
  };

  return (
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
  );
}
