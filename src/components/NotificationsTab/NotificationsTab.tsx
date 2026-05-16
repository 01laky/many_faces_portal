import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getNotifications, type NotificationItem } from '../../api/services/NotificationsService';
import { useMessenger } from '../../contexts/MessengerContext';
import './NotificationsTab.scss';

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function NotificationsTab({ token }: { token: string }) {
  const { t } = useTranslation('common');
  const { onNotification } = useMessenger();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const items = await getNotifications(token);
      setNotifications(items);
    } catch {
      toast.error(t('notifications.loadError'));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await load();
    })();
  }, [load]);

  useEffect(() => {
    const unsub = onNotification((_id, title, message, type) => {
      toast.info(`${title}: ${message}`, { autoClose: 5000 });
      setNotifications((prev) => [
        { id: _id, title, message, type, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    });
    return unsub;
  }, [onNotification]);

  return (
    <div className="notifications-tab">
      <div className="notifications-tab-header">
        <Bell size={20} />
        <h3>{t('notifications.title')}</h3>
      </div>
      {loading ? (
        <div className="notifications-tab-loading">
          <Loader2 size={24} className="spin" />
          <span>{t('notifications.loading')}</span>
        </div>
      ) : notifications.length === 0 ? (
        <p className="notifications-tab-empty">{t('notifications.noNotifications')}</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li key={n.id} className={`notification-item notification-item--${n.type}`}>
              <div className="notification-item-header">
                <span className="notification-item-title">{n.title}</span>
                <span className="notification-item-time">{formatTime(n.createdAt)}</span>
              </div>
              <p className="notification-item-message">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
