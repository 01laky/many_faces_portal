import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { upsertFaceProfileReview } from '../../../../api/services/faceProfilesApi';
import { useFaceMemberDetail } from '../../context/useFaceMemberDetail';
import type { ProfileReviewsSectionProps } from './types';

export function ProfileReviewsSection({
	showRecensionsDisabledMessage = true,
	hideWhenRecensionsDisabled = false,
}: ProfileReviewsSectionProps) {
	const { t } = useTranslation('common');
	const { faceId, userId, detail, reviews, token, isSelf, refreshAll } = useFaceMemberDetail();
	const [revTitle, setRevTitle] = useState('');
	const [revText, setRevText] = useState('');
	const [revStars, setRevStars] = useState(5);

	if (hideWhenRecensionsDisabled && !detail.faceAllowsRecensions) {
		return null;
	}

	const handleReview = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token || !revTitle.trim() || !revText.trim()) return;
		try {
			await upsertFaceProfileReview(
				faceId,
				userId,
				{ title: revTitle.trim(), text: revText.trim(), stars: revStars },
				token
			);
			setRevTitle('');
			setRevText('');
			await refreshAll();
		} catch {
			toast.error(t('faceProfiles.reviewError'));
		}
	};

	return (
		<section className="face-profile-detail-page__section">
			<h2>{t('faceProfiles.reviews')}</h2>
			{!detail.faceAllowsRecensions && showRecensionsDisabledMessage && (
				<p className="face-profile-detail-page__muted">{t('faceProfiles.recensionsDisabled')}</p>
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
	);
}
