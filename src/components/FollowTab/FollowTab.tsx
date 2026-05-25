import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
	getFollowing,
	getFollowers,
	unfollowUser,
	type FollowUserItem,
} from '../../api/services/UserFollowsService';
import './FollowTab.scss';

export function FollowTab({ token }: { token: string }) {
	const { t } = useTranslation('common');
	const [following, setFollowing] = useState<FollowUserItem[]>([]);
	const [followers, setFollowers] = useState<FollowUserItem[]>([]);
	const [loadingFollowing, setLoadingFollowing] = useState(true);
	const [loadingFollowers, setLoadingFollowers] = useState(true);
	const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

	const loadFollowing = useCallback(async () => {
		await Promise.resolve();
		try {
			setLoadingFollowing(true);
			const data = await getFollowing(token);
			setFollowing(data);
		} catch {
			toast.error(t('userFollow.loadError'));
			setFollowing([]);
		} finally {
			setLoadingFollowing(false);
		}
	}, [token, t]);

	const loadFollowers = useCallback(async () => {
		await Promise.resolve();
		try {
			setLoadingFollowers(true);
			const data = await getFollowers(token);
			setFollowers(data);
		} catch {
			toast.error(t('userFollow.loadError'));
			setFollowers([]);
		} finally {
			setLoadingFollowers(false);
		}
	}, [token, t]);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			await loadFollowing();
			await loadFollowers();
		})();
	}, [loadFollowing, loadFollowers]);

	const handleUnfollow = async (userId: string) => {
		try {
			setUnfollowingId(userId);
			await unfollowUser(userId, token);
			setFollowing((prev) => prev.filter((f) => f.userId !== userId));
			toast.success(t('userFollow.unfollowed'));
		} catch {
			toast.error(t('userFollow.unfollowError'));
		} finally {
			setUnfollowingId(null);
		}
	};

	return (
		<div className="follow-tab">
			<section className="follow-section">
				<h3 className="follow-heading">
					{t('userFollow.following')} ({loadingFollowing ? '…' : following.length})
				</h3>
				{loadingFollowing ? (
					<div className="follow-loading">
						<Loader2 size={24} className="spin" />
						<span>{t('userFollow.loading')}</span>
					</div>
				) : following.length === 0 ? (
					<p className="follow-empty">{t('userFollow.noFollowing')}</p>
				) : (
					<ul className="follow-list">
						{following.map((f) => (
							<li key={f.id} className="follow-item">
								<div className="follow-info">
									<span className="follow-name">{f.name?.trim() || f.email || '—'}</span>
									{f.email && <span className="follow-email">{f.email}</span>}
								</div>
								<button
									type="button"
									className="follow-unfollow-btn"
									onClick={() => handleUnfollow(f.userId)}
									disabled={unfollowingId !== null}
									aria-label={t('userFollow.unfollow')}
								>
									{unfollowingId === f.userId ? (
										<Loader2 size={18} className="spin" />
									) : (
										<UserMinus size={18} />
									)}
								</button>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="follow-section">
				<h3 className="follow-heading">
					{t('userFollow.followers')} ({loadingFollowers ? '…' : followers.length})
				</h3>
				{loadingFollowers ? (
					<div className="follow-loading">
						<Loader2 size={24} className="spin" />
						<span>{t('userFollow.loading')}</span>
					</div>
				) : followers.length === 0 ? (
					<p className="follow-empty">{t('userFollow.noFollowers')}</p>
				) : (
					<ul className="follow-list">
						{followers.map((f) => (
							<li key={f.id} className="follow-item">
								<div className="follow-info">
									<span className="follow-name">{f.name?.trim() || f.email || '—'}</span>
									{f.email && <span className="follow-email">{f.email}</span>}
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
