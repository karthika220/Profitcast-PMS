import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const TYPE_ICONS = {
  TASK_ASSIGNED: '✅',
  TASK_UPDATED: '🔄',
  TASK_OVERDUE: '⚠️',
  PROJECT_CREATED: '📁',
  PROJECT_UPDATED: '📝',
  MILESTONE_DUE: '🏁',
  COMMENT_ADDED: '💬',
  TIMESHEET_REMINDER: '⏰',
  LEAVE_APPLIED: '🌴',
  LEAVE_APPROVED: '✅',
  LEAVE_REJECTED: '❌',
  GENERAL: '🔔',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 50 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch {}
  };

  const timeAgo = (date) => {
    const secs = Math.floor((new Date() - new Date(date)) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-blue-600 text-sm font-medium mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">Mark all as read</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-gray-700">All caught up!</h3>
          <p className="text-gray-400 text-sm mt-1">No notifications to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card p-4 flex items-start gap-4 transition-colors ${!n.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-blue-900' : 'text-gray-900'}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{timeAgo(n.createdAt)}</span>
                  {n.sender && <span>from {n.sender.firstName} {n.sender.lastName}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n.id)} className="text-blue-600 hover:text-blue-700 text-xs font-medium whitespace-nowrap">Mark read</button>
                )}
                <button onClick={() => handleDelete(n.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
