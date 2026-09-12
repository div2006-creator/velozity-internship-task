import React from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { NotificationItem } from '../NotificationDropdown';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Real-time push notifications and activity updates.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-primary" onClick={onMarkAllRead} style={{ fontSize: '0.8rem' }}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>
              No notifications present.
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: item.isRead ? '#FAF9F7' : '#EEF2FF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: item.isRead ? '#FFFFFF' : '#4338CA',
                      color: item.isRead ? '#71717A' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: item.isRead ? 500 : 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.message}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {item.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
