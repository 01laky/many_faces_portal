import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Check, X, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useMessenger } from '../../contexts/MessengerContext';
import {
	getPendingFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	type FriendRequestItem,
} from '../../api/services/FriendRequestsService';
import { getUsers, type UserListItem } from '../../api/services/UsersListService';
import './FriendRequestsTab.scss';

// Conservative estimates: item (padding+border+content) + gap, pagination row, safety margin
const ITEM_HEIGHT_PX = 70;
const PAGINATION_HEIGHT_PX = 56;
const SAFETY_MARGIN_PX = 16;
const MIN_PAGE_SIZE = 1;

function formatUserName(u: {
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
}) {
	const first = u.firstName?.trim() || '';
	const last = u.lastName?.trim() || '';
	const name = [first, last].filter(Boolean).join(' ');
	return name || u.email || '—';
}

export function FriendRequestsTab({ token }: { token: string }) {
	const { t } = useTranslation('common');
	const { onFriendRequest } = useMessenger();
	const [requests, setRequests] = useState<FriendRequestItem[]>([]);
	const [requestsLoading, setRequestsLoading] = useState(true);
	const [addableUsers, setAddableUsers] = useState<UserListItem[]>([]);
	const [addableTotalCount, setAddableTotalCount] = useState(0);
	const [addableTotalPages, setAddableTotalPages] = useState(1);
	const [addableLoading, setAddableLoading] = useState(true);
	const [sendingTo, setSendingTo] = useState<string | null>(null);
	const [actioningId, setActioningId] = useState<number | null>(null);
	const [sentToIds, setSentToIds] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [addFriendPage, setAddFriendPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const listWrapperRef = useRef<HTMLDivElement>(null);

	const loadRequests = useCallback(async () => {
		await Promise.resolve();
		try {
			setRequestsLoading(true);
			const reqs = await getPendingFriendRequests(token);
			setRequests(reqs);
		} catch {
			toast.error(t('friendRequests.loadError'));
			setRequests([]);
		} finally {
			setRequestsLoading(false);
		}
	}, [token, t]);

	const loadAddableUsers = useCallback(async () => {
		try {
			setAddableLoading(true);
			const data = await getUsers(token, {
				page: addFriendPage,
				pageSize,
				search: searchQuery.trim() || undefined,
				forAddFriend: true,
			});
			setAddableUsers(data.items);
			setAddableTotalCount(data.totalCount);
			setAddableTotalPages(data.totalPages);
		} catch {
			toast.error(t('friendRequests.loadError'));
			setAddableUsers([]);
			setAddableTotalCount(0);
			setAddableTotalPages(1);
		} finally {
			setAddableLoading(false);
		}
	}, [token, addFriendPage, searchQuery, pageSize, t]);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			await loadRequests();
		})();
	}, [loadRequests]);

	useLayoutEffect(() => {
		const el = listWrapperRef.current;
		if (!el) return;
		const update = () => {
			const h = el.clientHeight;
			if (h <= 0) return;
			const forList = Math.max(0, h - PAGINATION_HEIGHT_PX - SAFETY_MARGIN_PX);
			const n = Math.max(MIN_PAGE_SIZE, Math.floor(forList / ITEM_HEIGHT_PX));
			queueMicrotask(() => setPageSize((prev) => (prev !== n ? n : prev)));
		};
		queueMicrotask(update);
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		void (async () => {
			await Promise.resolve();
			await loadAddableUsers();
		})();
	}, [loadAddableUsers]);

	useEffect(() => {
		const unsub = onFriendRequest(() => {
			loadRequests();
			loadAddableUsers();
		});
		return unsub;
	}, [onFriendRequest, loadRequests, loadAddableUsers]);

	// Debounced search: sync searchInput -> searchQuery after 300ms
	useEffect(() => {
		searchDebounceRef.current = setTimeout(() => {
			setSearchQuery(searchInput);
			setAddFriendPage(1);
		}, 300);
		return () => {
			if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
		};
	}, [searchInput]);

	const handleAccept = async (id: number) => {
		try {
			setActioningId(id);
			await acceptFriendRequest(id, token);
			setRequests((prev) => prev.filter((r) => r.id !== id));
			toast.success(t('friendRequests.accepted'));
		} catch {
			toast.error(t('friendRequests.acceptError'));
		} finally {
			setActioningId(null);
		}
	};

	const handleReject = async (id: number) => {
		try {
			setActioningId(id);
			await rejectFriendRequest(id, token);
			setRequests((prev) => prev.filter((r) => r.id !== id));
			toast.success(t('friendRequests.rejected'));
		} catch {
			toast.error(t('friendRequests.rejectError'));
		} finally {
			setActioningId(null);
		}
	};

	const handleSend = async (receiverId: string) => {
		try {
			setSendingTo(receiverId);
			await sendFriendRequest(receiverId, token);
			setSentToIds((prev) => new Set(prev).add(receiverId));
			toast.success(t('friendRequests.sent'));
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : t('friendRequests.sendError');
			toast.error(msg);
		} finally {
			setSendingTo(null);
		}
	};

	useEffect(() => {
		if (addFriendPage > addableTotalPages && addableTotalPages > 0) {
			queueMicrotask(() => setAddFriendPage(addableTotalPages));
		}
	}, [addFriendPage, addableTotalPages]);

	const displayUsers = addableUsers.filter((u) => !sentToIds.has(u.id));

	return (
		<div className="friend-requests-tab">
			<section className="friend-requests-section">
				<h3 className="friend-requests-heading">{t('friendRequests.incoming')}</h3>
				{requestsLoading ? (
					<div className="friend-requests-loading">
						<Loader2 size={24} className="spin" />
						<span>{t('friendRequests.loading')}</span>
					</div>
				) : requests.length === 0 ? (
					<p className="friend-requests-empty">{t('friendRequests.noRequests')}</p>
				) : (
					<ul className="friend-requests-list">
						{requests.map((r) => (
							<li key={r.id} className="friend-request-item">
								<div className="friend-request-info">
									<span className="friend-request-name">{r.senderName}</span>
									{r.senderEmail && <span className="friend-request-email">{r.senderEmail}</span>}
								</div>
								<div className="friend-request-actions">
									<button
										type="button"
										className="friend-request-btn friend-request-btn--accept"
										onClick={() => handleAccept(r.id)}
										disabled={actioningId !== null}
										aria-label={t('friendRequests.accept')}
									>
										{actioningId === r.id ? (
											<Loader2 size={18} className="spin" />
										) : (
											<Check size={18} />
										)}
									</button>
									<button
										type="button"
										className="friend-request-btn friend-request-btn--reject"
										onClick={() => handleReject(r.id)}
										disabled={actioningId !== null}
										aria-label={t('friendRequests.reject')}
									>
										<X size={18} />
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="friend-requests-section friend-requests-section--add-friend">
				<h3 className="friend-requests-heading">{t('friendRequests.addFriend')}</h3>
				<div className="friend-requests-search">
					<Search size={16} className="friend-requests-search-icon" />
					<input
						type="text"
						className="friend-requests-search-input"
						placeholder={t('friendRequests.searchPlaceholder')}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
				</div>
				<div ref={listWrapperRef} className="friend-requests-list-wrapper">
					{addableLoading ? (
						<div className="friend-requests-loading">
							<Loader2 size={24} className="spin" />
							<span>{t('friendRequests.loading')}</span>
						</div>
					) : addableTotalCount === 0 ? (
						<p className="friend-requests-empty">
							{searchQuery.trim()
								? t('friendRequests.noSearchResults')
								: t('friendRequests.noUsersToAdd')}
						</p>
					) : (
						<>
							<ul className="friend-requests-list friend-requests-list--addable">
								{displayUsers.map((u) => (
									<li key={u.id} className="friend-request-item">
										<div className="friend-request-info">
											<span className="friend-request-name">{formatUserName(u)}</span>
											{u.email && <span className="friend-request-email">{u.email}</span>}
										</div>
										<button
											type="button"
											className="friend-request-btn friend-request-btn--send"
											onClick={() => handleSend(u.id)}
											disabled={sendingTo !== null}
											aria-label={t('friendRequests.sendRequest')}
										>
											{sendingTo === u.id ? (
												<Loader2 size={18} className="spin" />
											) : (
												<UserPlus size={18} />
											)}
										</button>
									</li>
								))}
							</ul>
							{addableTotalPages > 1 && (
								<div className="friend-requests-pagination">
									<button
										type="button"
										className="friend-requests-pagination-btn"
										onClick={() => setAddFriendPage((p) => Math.max(1, p - 1))}
										disabled={addFriendPage <= 1}
										aria-label={t('friendRequests.prevPage')}
									>
										<ChevronLeft size={18} />
									</button>
									<span className="friend-requests-pagination-info">
										{t('friendRequests.pageInfo', {
											page: addFriendPage,
											total: addableTotalPages,
											count: addableTotalCount,
										})}
									</span>
									<button
										type="button"
										className="friend-requests-pagination-btn"
										onClick={() => setAddFriendPage((p) => Math.min(addableTotalPages, p + 1))}
										disabled={addFriendPage >= addableTotalPages}
										aria-label={t('friendRequests.nextPage')}
									>
										<ChevronRight size={18} />
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</section>
		</div>
	);
}
