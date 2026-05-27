/**
 * UserProfileCarousel - Face profiles carousel (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gridBlockI18nKeys as k } from '../gridBlockI18n';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useGridBlockFetchEnabled } from '../../../contexts/GridBlockFetchContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { useUserProfilesGridQuery } from '../../../hooks/api/gridQueries';
import { profileAvatarUrl } from '../gridDisplayHelpers';
import { GridMediaImage } from '../../GridMediaImage/GridMediaImage';
import {
	useStablePaginationEmit,
	useSyncedPaginationReport,
} from '../../../hooks/usePaginationParentSync';
import './UserProfileCarousel.scss';
import type { UserProfileCarouselProps } from './types';
import { CARD_WIDTH, CARD_GAP } from './constants';

export function UserProfileCarousel({
	page: controlledPage,
	totalPages: _totalPages,
	onPageChange,
}: UserProfileCarouselProps = {}) {
	const { t } = useTranslation('common');
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { token } = useAuth();
	const { selectedFace } = useFaceConfig();
	const faceId = selectedFace?.id;
	const faceIndex = selectedFace?.index;

	const fetchEnabled = useGridBlockFetchEnabled();
	const {
		data: profiles = [],
		isLoading: loading,
		isError: loadError,
	} = useUserProfilesGridQuery(token, faceId, fetchEnabled);
	const [visibleCount, setVisibleCount] = useState(3);
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const calcVisible = useCallback(() => {
		if (!containerRef.current) return;
		const w = containerRef.current.clientWidth - 60;
		const count = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
		setVisibleCount(count);
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		queueMicrotask(() => calcVisible());
		const ro = new ResizeObserver(() => calcVisible());
		ro.observe(el);
		return () => ro.disconnect();
	}, [calcVisible]);

	const totalPages = Math.max(1, Math.ceil(profiles.length / visibleCount));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleProfiles = useMemo(
		() => profiles.slice(clampedPage * visibleCount, (clampedPage + 1) * visibleCount),
		[profiles, clampedPage, visibleCount]
	);

	const emitPage = useStablePaginationEmit(onPageChange);
	useSyncedPaginationReport(emitPage, clampedPage, totalPages);

	const setPage = useCallback(
		(value: number | ((prev: number) => number)) => {
			const next =
				typeof value === 'function'
					? value(isControlled ? (controlledPage ?? 0) : internalPage)
					: value;
			if (isControlled) emitPage(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
			else setInternalPage(next);
		},
		[isControlled, controlledPage, internalPage, totalPages, emitPage]
	);

	const showInternalNav = !isControlled;

	if (faceId == null || !faceIndex) {
		return (
			<div
				className="userprofile-carousel-component userprofile-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.selectFace)}</p>
			</div>
		);
	}

	if (!token) {
		return (
			<div
				className="userprofile-carousel-component userprofile-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.guest.profiles)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="userprofile-carousel-component userprofile-carousel-component--message"
				ref={containerRef}
			>
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div
				className="userprofile-carousel-component userprofile-carousel-component--message"
				ref={containerRef}
			>
				<p>{t(k.loadError.profiles)}</p>
			</div>
		);
	}

	return (
		<div className="userprofile-carousel-component" ref={containerRef}>
			{showInternalNav && (
				<button
					type="button"
					className="userprofile-carousel-nav userprofile-carousel-prev"
					disabled={clampedPage === 0}
					onClick={() => setPage((p) => p - 1)}
				>
					‹
				</button>
			)}

			<div className="userprofile-carousel-track">
				{visibleProfiles.map((profile, index) => {
					const name = profile.displayName?.trim() || t(k.profileCardRoleMember);
					const path = getLocalizedPath(
						`${faceIndex}/profile/${encodeURIComponent(profile.userId)}`
					);
					return (
						<div
							key={profile.userId}
							className="userprofile-carousel-card"
							style={{ width: CARD_WIDTH }}
							onClick={() => navigate(path)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter') navigate(path);
							}}
						>
							<GridMediaImage
								className="userprofile-carousel-avatar"
								src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
								alt={name}
								priority={index === 0}
							/>
							<span className="userprofile-carousel-card-name">{name}</span>
							<span className="userprofile-carousel-card-role">{t(k.profileCardRoleMember)}</span>
						</div>
					);
				})}
			</div>

			{showInternalNav && (
				<button
					type="button"
					className="userprofile-carousel-nav userprofile-carousel-next"
					disabled={clampedPage >= totalPages - 1}
					onClick={() => setPage((p) => p + 1)}
				>
					›
				</button>
			)}

			{showInternalNav && totalPages > 1 && (
				<div className="userprofile-carousel-dots">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							type="button"
							className={`userprofile-carousel-dot ${i === clampedPage ? 'active' : ''}`}
							onClick={() => setPage(i)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
