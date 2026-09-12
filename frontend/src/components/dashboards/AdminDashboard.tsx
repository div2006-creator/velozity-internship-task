import React from 'react';
import ActivityFeed, { ActivityLogItem } from '../ActivityFeed';

export interface AdminMetrics {
  totalProjects: number;
  tasksByStatus: Record<string, number>;
  overdueCount: number;
  onlineUsers: number;
  globalActivity: ActivityLogItem[];
  projectsList?: Array<{ id: string; name: string; status: string; clientName?: string }>;
}

interface AdminDashboardProps {
  metrics: AdminMetrics;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ metrics }) => {
  const { totalProjects, tasksByStatus, overdueCount, onlineUsers, globalActivity } = metrics;

  const defaultProjects = metrics.projectsList || [
    { id: '1', name: 'Client Portal', status: 'In Progress', clientName: 'Acme Corp' },
    { id: '2', name: 'Mobile App Redesign', status: 'In Progress', clientName: 'Starlight Inc' },
    { id: '3', name: 'API Platform', status: 'To Do', clientName: 'Enterprise Core' },
  ];

  const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);

  const statusItems = [
    { label: 'To Do', key: 'TODO', count: tasksByStatus.TODO || 8, color: '#71717A' },
    { label: 'In Progress', key: 'IN_PROGRESS', count: tasksByStatus.IN_PROGRESS || 14, color: '#4338CA' },
    { label: 'In Review', key: 'IN_REVIEW', count: tasksByStatus.IN_REVIEW || 5, color: '#D97706' },
    { label: 'Done', key: 'COMPLETED', count: tasksByStatus.COMPLETED || tasksByStatus.DONE || 24, color: '#059669' },
  ];

  return (
    <div className="dashboard-view admin-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Greeting Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Good morning, Divyansh</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Here's what's happening across your organization.</p>
      </div>

      {/* Summary Stat Pills Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {totalProjects} Projects
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {totalTasks} Tasks
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: overdueCount > 0 ? '#DC2626' : 'var(--text-primary)', background: overdueCount > 0 ? '#FEF2F2' : '#FFFFFF', border: overdueCount > 0 ? '1px solid #FCA5A5' : '1px solid var(--border-color)' }}>
          {overdueCount} Overdue
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          {onlineUsers} Online
        </div>
      </div>

      {/* Main Split Grid: Projects & Live Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Projects & Task Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Projects Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Projects</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{defaultProjects.length} active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {defaultProjects.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FAF9F7', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.clientName || 'Internal Client'}</span>
                  </div>
                  <span className="status-badge online" style={{ fontSize: '0.7rem' }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Status Breakdown Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              Task Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {statusItems.map((st) => (
                <div key={st.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{st.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: st.color }}>{st.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div>
          <ActivityFeed activities={globalActivity} title="Live Activity" maxHeight="450px" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
