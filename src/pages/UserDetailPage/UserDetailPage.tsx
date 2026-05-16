import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  UserCircle,
  Loader2,
  ShieldBan,
  ShieldCheck,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { getUser, type UserListItem } from '../../api/services/UsersListService';
import { getBlockStatus, blockUser, unblockUser } from '../../api/services/UserBlocksService';
import { getFollowStatus, followUser, unfollowUser } from '../../api/services/UserFollowsService';
import './UserDetailPage.scss';

export function UserDetailPage({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const [user, setUser] = useState<UserListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setLoading(false);
        setError(true);
      });
      return;
    }
    let cancelled = false;
    getUser(id, token)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    getBlockStatus(id, token)
      .then((data) => {
        if (!cancelled) setIsBlocked(data.isBlocked);
      })
      .catch(() => {});
    getFollowStatus(id, token)
      .then((data) => {
        if (!cancelled) setIsFollowing(data.isFollowing);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const handleToggleBlock = async () => {
    if (!id) return;
    try {
      setBlockLoading(true);
      if (isBlocked) {
        await unblockUser(id, token);
        setIsBlocked(false);
        toast.success(t('userBlock.unblocked'));
      } else {
        await blockUser(id, token);
        setIsBlocked(true);
        toast.success(t('userBlock.blocked'));
      }
    } catch {
      toast.error(isBlocked ? t('userBlock.unblockError') : t('userBlock.blockError'));
    } finally {
      setBlockLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!id) return;
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(id, token);
        setIsFollowing(false);
        toast.success(t('userFollow.unfollowed'));
      } else {
        await followUser(id, token);
        setIsFollowing(true);
        toast.success(t('userFollow.followed'));
      }
    } catch {
      toast.error(isFollowing ? t('userFollow.unfollowError') : t('userFollow.followError'));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBack = () => navigate(getLocalizedPath('/users'));

  if (loading) {
    return (
      <div className="user-detail-page user-detail-page--loading">
        <Loader2 size={32} className="spin" />
        <span>{t('pages.userDetail.loading')}</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-detail-page user-detail-page--error">
        <h2>{t('pages.userDetail.notFound')}</h2>
        <button type="button" className="user-detail-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          {t('common.back', 'Back')}
        </button>
      </div>
    );
  }

  const displayName =
    [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ') ||
    user.email ||
    user.id;

  return (
    <div className="user-detail-page">
      <button type="button" className="user-detail-back-btn" onClick={handleBack}>
        <ArrowLeft size={18} />
        {t('common.back', 'Back')}
      </button>
      <div className="user-detail-card">
        <div className="user-detail-avatar">
          <UserCircle size={80} />
        </div>
        <h1 className="user-detail-name">{displayName}</h1>
        <dl className="user-detail-fields">
          <div className="user-detail-field">
            <dt>{t('pages.userDetail.id')}</dt>
            <dd>{user.id}</dd>
          </div>
          {user.email && (
            <div className="user-detail-field">
              <dt>{t('pages.userDetail.email')}</dt>
              <dd>{user.email}</dd>
            </div>
          )}
          {user.firstName && (
            <div className="user-detail-field">
              <dt>{t('pages.userDetail.firstName')}</dt>
              <dd>{user.firstName}</dd>
            </div>
          )}
          {user.lastName && (
            <div className="user-detail-field">
              <dt>{t('pages.userDetail.lastName')}</dt>
              <dd>{user.lastName}</dd>
            </div>
          )}
          {user.createdAt && (
            <div className="user-detail-field">
              <dt>{t('pages.userDetail.createdAt')}</dt>
              <dd>{new Date(user.createdAt).toLocaleString()}</dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          className={`user-detail-block-btn ${isBlocked ? 'user-detail-block-btn--blocked' : ''}`}
          onClick={handleToggleBlock}
          disabled={blockLoading}
        >
          {blockLoading ? (
            <Loader2 size={18} className="spin" />
          ) : isBlocked ? (
            <ShieldCheck size={18} />
          ) : (
            <ShieldBan size={18} />
          )}
          {isBlocked ? t('userBlock.unblock') : t('userBlock.block')}
        </button>
        <button
          type="button"
          className={`user-detail-follow-btn ${isFollowing ? 'user-detail-follow-btn--following' : ''}`}
          onClick={handleToggleFollow}
          disabled={followLoading}
        >
          {followLoading ? (
            <Loader2 size={18} className="spin" />
          ) : isFollowing ? (
            <UserCheck size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {isFollowing ? t('userFollow.unfollow') : t('userFollow.follow')}
        </button>
      </div>
    </div>
  );
}
