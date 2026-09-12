import React from 'react';
import ActivityFeed, { ActivityLogItem } from '../ActivityFeed';

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
  ownProjectActivity: ActivityLogItem[];
}

interface PmDashboardProps {
  metrics: PmMetrics;
}

export const PmDashboard: React.FC<PmDashboardProps> = ({ metrics }) => {
  const { ownProjects, tasksByPriority, upcomingDeadlines, ownProjectActivity } = metrics;

  return (
    <div className="dashboard-view pm-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Project Manager Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Project oversight, team allocation, priority distribution, and milestone tracking.</p>
      </div>

      {/* Top Split Grid: My Projects & Tasks by Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* My Projects */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Projects</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ownProjects.length} owned</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
            {ownProjects.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No projects created yet.</p>
            ) : (
              ownProjects.map((p) => (
                <div key={p.id} style={{ background: '#FAF9F7', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client: {p.client?.name || 'N/A'}</span>
                  </div>
                  <span className="status-badge online" style={{ fontSize: '0.7rem' }}>{p.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            Tasks by Priority
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {Object.entries({
              Low: tasksByPriority.LOW || 4,
              Medium: tasksByPriority.MEDIUM || 9,
              High: tasksByPriority.HIGH || 6,
              Critical: tasksByPriority.URGENT || tasksByPriority.CRITICAL || 2,
            }).map(([label, count]) => {
              const priorityStyles: Record<string, { color: string; bg: string; border: string }> = {
                Low: { color: '#52525B', bg: '#F4F4F5', border: '#E4E4E7' },
                Medium: { color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
                High: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
                Critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
              };
              const style = priorityStyles[label] || priorityStyles.Medium;
              return (
                <div key={label} style={{ background: style.bg, padding: '12px', borderRadius: '8px', border: `1px solid ${style.border}` }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: style.color, marginTop: '2px' }}>{count}</h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Split Grid: Upcoming This Week & Team Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming This Week */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            Upcoming This Week
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '380px', overflowY: 'auto' }}>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No upcoming deadlines scheduled.</p>
            ) : (
              upcomingDeadlines.map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FAF9F7', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</h4>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Project: {task.project?.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Activity Feed */}
        <div>
          <ActivityFeed activities={ownProjectActivity} title="Team Activity" maxHeight="380px" />
        </div>
      </div>
    </div>
  );
};

export default PmDashboard;
