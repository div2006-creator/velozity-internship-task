import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, Users, Activity, Clock } from 'lucide-react';

export interface AdminMetrics {
  totalProjects: number;
  tasksByStatus: Record<string, number>;
  overdueCount: number;
  onlineUsers: number;
  globalActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: { name: string; email: string };
    project?: { name: string };
    task?: { title: string };
    formattedMessage?: string;
  }>;
}

interface AdminDashboardProps {
  metrics: AdminMetrics;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ metrics }) => {
  const { totalProjects, tasksByStatus, overdueCount, onlineUsers, globalActivity } = metrics;

  return (
    <div className="dashboard-view admin-view">
      <div className="dashboard-header-title" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>System Administration Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Global overview across all organization projects, users, and real-time activity</p>
      </div>

      {/* KPI Cards Row */}
      <div className="tech-grid" style={{ marginBottom: '2rem' }}>
        {/* Total Projects */}
        <div className="glass-panel tech-card">
          <div className="tech-card-header">
            <div className="tech-icon" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA' }}>
              <Layers size={22} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Projects</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalProjects}</h3>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active system repositories</p>
        </div>

        {/* Overdue Count */}
        <div className="glass-panel tech-card">
          <div className="tech-card-header">
            <div className="tech-icon" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Overdue Tasks</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? '#DC2626' : 'var(--text-primary)' }}>{overdueCount}</h3>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Background job scheduler count</p>
        </div>

        {/* Online Users */}
        <div className="glass-panel tech-card">
          <div className="tech-card-header">
            <div className="tech-icon" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669' }}>
              <Users size={22} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Online Users</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#059669' }}>{onlineUsers}</h3>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active WebSocket sockets</p>
        </div>

        {/* Total Tasks Count */}
        <div className="glass-panel tech-card">
          <div className="tech-card-header">
            <div className="tech-icon" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#7C3AED' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Tasks</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Object.values(tasksByStatus).reduce((a, b) => a + b, 0)}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tasks across all projects</p>
        </div>
      </div>

      {/* Main Split Section: Tasks by Status & Global Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Tasks by Status Matrix */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Activity size={18} style={{ color: '#4338CA' }} /> Tasks by Status Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(tasksByStatus).map(([statusKey, count]) => {
              const statusColors: Record<string, string> = {
                TODO: '#71717A',
                IN_PROGRESS: '#4338CA',
                IN_REVIEW: '#D97706',
                COMPLETED: '#059669',
                BLOCKED: '#DC2626',
                OVERDUE: '#DC2626',
              };
              const color = statusColors[statusKey] || '#4338CA';
              return (
                <div key={statusKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{statusKey.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, color }}>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: '#F4F4F5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(count * 20, 100)}%`, background: color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Clock size={18} style={{ color: '#7C3AED' }} /> Global System Activity Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '350px', overflowY: 'auto' }}>
            {globalActivity.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No activity logged yet.</p>
            ) : (
              globalActivity.map((log) => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {log.formattedMessage || `${log.user?.name || 'User'} executed ${log.action}`}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

