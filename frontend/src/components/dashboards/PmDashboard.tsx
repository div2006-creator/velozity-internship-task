import React from 'react';
import { Briefcase, AlertCircle, Calendar, Activity } from 'lucide-react';

export interface PmMetrics {
  totalOwnProjects: number;
  ownProjects: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
    client?: { name: string; company: string };
    _count?: { tasks: number };
  }>;
  tasksByPriority: Record<string, number>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    project?: { name: string };
    assignedDeveloper?: { name: string; email: string };
  }>;
  ownProjectActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: { name: string };
    formattedMessage?: string;
  }>;
}

interface PmDashboardProps {
  metrics: PmMetrics;
}

export const PmDashboard: React.FC<PmDashboardProps> = ({ metrics }) => {
  const { ownProjects, tasksByPriority, upcomingDeadlines, ownProjectActivity } = metrics;

  return (
    <div className="dashboard-view pm-view">
      <div className="dashboard-header-title" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Project Manager Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Project oversight, team allocation, priority distribution, and upcoming milestones</p>
      </div>

      {/* Top Grid: Own Projects & Priority Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Own Projects Grid */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} style={{ color: '#6366f1' }} /> Own Created Projects ({ownProjects.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {ownProjects.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No projects created yet.</p>
            ) : (
              ownProjects.map((p) => (
                <div key={p.id} style={{ background: 'rgba(15,23,42,0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{p.name}</h4>
                    <span className="status-badge online" style={{ fontSize: '0.75rem' }}>{p.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Client: {p.client?.name || 'N/A'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ color: '#f59e0b' }} /> Tasks by Priority Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {Object.entries(tasksByPriority).map(([priorityKey, count]) => {
              const priorityColors: Record<string, string> = {
                LOW: '#94a3b8',
                MEDIUM: '#38bdf8',
                HIGH: '#f59e0b',
                URGENT: '#ef4444',
              };
              const color = priorityColors[priorityKey] || '#6366f1';
              return (
                <div key={priorityKey} style={{ background: 'rgba(15,23,42,0.5)', padding: '1rem', borderRadius: '8px', border: `1px solid ${color}40` }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{priorityKey}</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color, marginTop: '4px' }}>{count}</h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Deadlines & Own-Project Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Deadlines */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#10b981' }} /> Upcoming Deadlines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '300px', overflowY: 'auto' }}>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No upcoming deadlines scheduled.</p>
            ) : (
              upcomingDeadlines.map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.title}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project: {task.project?.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Own-Project Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#a855f7' }} /> Team & Project Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '300px', overflowY: 'auto' }}>
            {ownProjectActivity.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No recent activity in your projects.</p>
            ) : (
              ownProjectActivity.map((log) => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {log.formattedMessage || `${log.user?.name || 'Team member'} executed ${log.action}`}
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

export default PmDashboard;
