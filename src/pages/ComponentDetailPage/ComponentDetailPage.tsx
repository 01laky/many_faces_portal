import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RouteLoadingFallback } from '../../routes/routeLoadingFallback';
import { resolveComponentDetailDispatch } from './componentDetailDispatch';

const LazyChatRoomDetailPage = lazy(() =>
	import('../ChatRoomDetailPage').then((m) => ({ default: m.ChatRoomDetailPage }))
);
const LazyVideoLoungeDetailPage = lazy(() =>
	import('../VideoLoungeDetailPage').then((m) => ({ default: m.VideoLoungeDetailPage }))
);

/**
 * Unified detail route: `/detail/:componentTypeId/:entityId`
 * Dispatches by component type id (matches backend `ComponentTypeId`).
 */
export function ComponentDetailPage() {
	const { componentTypeId, entityId } = useParams<{
		componentTypeId: string;
		entityId: string;
	}>();
	const { t } = useTranslation('common');

	const typeId = Number(componentTypeId);
	const entity = Number(entityId);
	const dispatch = resolveComponentDetailDispatch(typeId, entity);

	if (dispatch === 'invalid') {
		return (
			<div style={{ padding: 24 }}>
				<p>{t('componentDetail.invalid', 'Invalid link.')}</p>
			</div>
		);
	}

	if (dispatch === 'chatRoom') {
		return (
			<Suspense fallback={<RouteLoadingFallback />}>
				<LazyChatRoomDetailPage roomId={entity} />
			</Suspense>
		);
	}

	if (dispatch === 'videoLounge') {
		return (
			<Suspense fallback={<RouteLoadingFallback />}>
				<LazyVideoLoungeDetailPage loungeId={entity} />
			</Suspense>
		);
	}

	return (
		<div style={{ padding: 24 }}>
			<p>{t('componentDetail.notImplemented', 'This detail type is not implemented yet.')}</p>
		</div>
	);
}
