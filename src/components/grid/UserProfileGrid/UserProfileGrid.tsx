/**
 * UserProfileGrid - Face profile directory (API-backed)
 */

import { useState, useRef, useCallback, useMemo, type CSSProperties } from 'react';
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
import { useFillGridPagination } from '../../../hooks/useFillGridPagination';
import './UserProfileGrid.scss';
import type { UserProfileGridProps } from './types';

export function UserProfileGrid({ page: controlledPage, onPageChange }: UserProfileGridProps = {}) {
	const { t } = useTranslation('common');
	const itemsRef = useRef<HTMLDivElement>(null);
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
	const [internalPage, setInternalPage] = useState(0);
	const isControlled = onPageChange != null;
	const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

	const observeGrid =
		faceId != null && Boolean(token) && Boolean(faceIndex) && !loading && !loadError;
	const { itemsPerPage, gridCols } = useFillGridPagination(itemsRef, observeGrid, isControlled, {
		gap: 6,
		minColWidth: 120,
		fixedCardHeightPx: 92,
	});

	const totalPages = Math.max(1, Math.ceil(profiles.length / itemsPerPage));
	const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
	const visibleProfiles = useMemo(
		() => profiles.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
		[profiles, clampedPage, itemsPerPage]
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

	const showInternalPagination = !isControlled;

	if (faceId == null || !faceIndex) {
		return (
			<div className="userprofile-grid-component userprofile-grid-component--message">
				<p>{t(k.selectFace)}</p>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="userprofile-grid-component userprofile-grid-component--message">
				<p>{t(k.guest.profiles)}</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="userprofile-grid-component userprofile-grid-component--message">
				<Loader2 size={28} aria-label={t(k.loadingAria)} />
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="userprofile-grid-component userprofile-grid-component--message">
				<p>{t(k.loadError.profiles)}</p>
			</div>
		);
	}

	const itemsStyle = { '--grid-cols': gridCols } as CSSProperties;

	return (
		<div className="userprofile-grid-component">
			<div className="userprofile-grid-items" ref={itemsRef} style={itemsStyle}>
				{visibleProfiles.map((profile, index) => {
					const name = profile.displayName?.trim() || t(k.profileCardRoleMember);
					const path = getLocalizedPath(
						`${faceIndex}/profile/${encodeURIComponent(profile.userId)}`
					);
					return (
						<div
							key={profile.userId}
							className="userprofile-grid-card"
							onClick={() => navigate(path)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter') navigate(path);
							}}
						>
							<GridMediaImage
								className="userprofile-grid-avatar"
								src={profileAvatarUrl(profile.userId, profile.avatarUrl)}
								alt={name}
								priority={index === 0}
							/>
							<span className="userprofile-grid-card-name">{name}</span>
							<span className="userprofile-grid-card-role">{t(k.profileCardRoleMember)}</span>
						</div>
					);
				})}
			</div>
			{profiles.length === 0 && (
				<p className="userprofile-grid-empty">{t(k.empty.profilesDirectory)}</p>
			)}
			{showInternalPagination && totalPages > 1 && (
				<div className="userprofile-grid-pagination">
					<button type="button" disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
						‹
					</button>
					<span>
						{clampedPage + 1} / {totalPages}
					</span>
					<button
						type="button"
						disabled={clampedPage >= totalPages - 1}
						onClick={() => setPage((p) => p + 1)}
					>
						›
					</button>
				</div>
			)}
		</div>
	);
}
