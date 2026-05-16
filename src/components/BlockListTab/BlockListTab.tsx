import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBlockedUsers,
  unblockUser,
  type BlockedUserItem,
} from '../../api/services/UserBlocksService';
import './BlockListTab.scss';

export function BlockListTab({ token }: { token: string }) {
  const { t } = useTranslation('common');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const loadBlocked = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const data = await getBlockedUsers(token);
      setBlockedUsers(data);
    } catch {
      toast.error(t('userBlock.loadError'));
      setBlockedUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadBlocked();
    })();
  }, [loadBlocked]);

  const handleUnblock = async (blockedId: string) => {
    try {
      setUnblockingId(blockedId);
      await unblockUser(blockedId, token);
      setBlockedUsers((prev) => prev.filter((b) => b.blockedId !== blockedId));
      toast.success(t('userBlock.unblocked'));
    } catch {
      toast.error(t('userBlock.unblockError'));
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="block-list-tab">
      <h3 className="block-list-heading">{t('userBlock.blockList')}</h3>
      {loading ? (
        <div className="block-list-loading">
          <Loader2 size={24} className="spin" />
          <span>{t('userBlock.loading')}</span>
        </div>
      ) : blockedUsers.length === 0 ? (
        <p className="block-list-empty">{t('userBlock.noBlockedUsers')}</p>
      ) : (
        <ul className="block-list">
          {blockedUsers.map((b) => (
            <li key={b.id} className="block-list-item">
              <div className="block-list-info">
                <span className="block-list-name">
                  {b.blockedName?.trim() || b.blockedEmail || '—'}
                </span>
                {b.blockedEmail && <span className="block-list-email">{b.blockedEmail}</span>}
              </div>
              <button
                type="button"
                className="block-list-unblock-btn"
                onClick={() => handleUnblock(b.blockedId)}
                disabled={unblockingId !== null}
                aria-label={t('userBlock.unblock')}
              >
                {unblockingId === b.blockedId ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
