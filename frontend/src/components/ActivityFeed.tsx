import React from 'react';
import { Clock, Activity as ActivityIcon } from 'lucide-react';

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  user?: { name: string; email?: string };
  project?: { name: string };
  task?: { title: string };
  formattedMessage?: string;
  oldStatus?: string;
  newStatus?: string;
  isNew?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityLogItem[];
  title?: string;
  maxHeight?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Live Activity Feed',
  maxHeight = '380px',
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with ● LIVE badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <ActivityIcon size={16} style={{ color: '#4338CA' }} /> {title}
        </h3>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          LIVE
        </span>
      </div>

      {/* Activity Log Feed Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight, paddingRight: '4px', flex: 1 }}>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>No recent activity logged.</p>
        ) : (
          activities.map((item) => {
            const userName = item.user?.name || 'Team member';
            const initial = userName.charAt(0).toUpperCase();
            const timeAgo = formatTimeAgo(item.timestamp);

            return (
              <div
                key={item.id}
                className={item.isNew ? 'activity-item-new' : ''}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#FAF9F7',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* User Avatar Circle */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    color: '#4338CA',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid #C7D2FE',
                  }}
                >
                  {initial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {userName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} /> {timeAgo}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35, wordBreak: 'break-word' }}>
                    {item.formattedMessage || `${item.action}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(timestampStr: string): string {
  try {
    const timestamp = new Date(timestampStr).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hrs ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  } catch (e) {
    return 'recently';
  }
}

export default ActivityFeed;
