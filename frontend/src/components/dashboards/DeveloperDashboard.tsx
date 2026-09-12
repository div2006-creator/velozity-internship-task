import React, { useState } from 'react';
import { ArrowUpDown, CheckCircle, Clock } from 'lucide-react';
import ActivityFeed, { ActivityLogItem } from '../ActivityFeed';

export interface DeveloperTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  project?: { name: string };
}

export interface DeveloperMetrics {
  totalAssignedTasks: number;
  assignedTasks: DeveloperTask[];
  prioritySorting: DeveloperTask[];
  assignedTaskActivity: ActivityLogItem[];
}

interface DeveloperDashboardProps {
  metrics: DeveloperMetrics;
  onUpdateStatus?: (taskId: string, newStatus: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  metrics,
  onUpdateStatus,
}) => {
  const { assignedTasks, prioritySorting, assignedTaskActivity } = metrics;
  const [usePrioritySort, setUsePrioritySort] = useState<boolean>(true);

  const displayTasks = usePrioritySort ? prioritySorting : assignedTasks;

  // Compute My Work Summary Badges
  const assignedCount = assignedTasks.length;
  const inProgressCount = assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = assignedTasks.filter((t) => t.status === 'IN_REVIEW').length;
  const overdueCount = assignedTasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).getTime() < Date.now() && t.status !== 'COMPLETED' && t.status !== 'DONE';
  }).length;

  return (
    <div className="dashboard-view developer-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Work</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Overview of your assigned tasks, current sprint items, and status controls.</p>
      </div>

      {/* Summary Stat Badges Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {assignedCount} Assigned
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#4338CA', background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          {inProgressCount} In Progress
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          {inReviewCount} In Review
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: overdueCount > 0 ? '#DC2626' : 'var(--text-muted)', background: overdueCount > 0 ? '#FEF2F2' : '#FFFFFF', border: overdueCount > 0 ? '1px solid #FCA5A5' : '1px solid var(--border-color)' }}>
          {overdueCount} Overdue
        </div>
      </div>

      {/* Main Split Grid: My Tasks Table & Activity Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* My Tasks Table Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Tasks</h3>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setUsePrioritySort(!usePrioritySort)}
            >
              <ArrowUpDown size={12} /> Sort by Priority: {usePrioritySort ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Clean Table: Priority | Task | Project | Status | Due Date */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Task</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Project</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Due Date</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No tasks assigned to you.
                    </td>
                  </tr>
                ) : (
                  displayTasks.map((task) => {
                    const priorityStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
                      LOW: { label: 'Low', color: '#52525B', bg: '#F4F4F5', border: '#E4E4E7' },
                      MEDIUM: { label: 'Medium', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
                      HIGH: { label: 'High', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
                      URGENT: { label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
                      CRITICAL: { label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
                    };
                    const pStyle = priorityStyles[task.priority] || priorityStyles.MEDIUM;
                    const statusDisplay = task.status === 'COMPLETED' ? 'Done' : task.status.replace('_', ' ');

                    return (
                      <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 6px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}`, padding: '2px 6px', borderRadius: '4px' }}>
                            {pStyle.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {task.title}
                        </td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                          {task.project?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <span className="status-badge online" style={{ fontSize: '0.7rem' }}>
                            {statusDisplay}
                          </span>
                        </td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                          {onUpdateStatus && (
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              {task.status !== 'IN_PROGRESS' && (
                                <button
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                                  onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                                  title="Mark In Progress"
                                >
                                  <Clock size={10} /> Progress
                                </button>
                              )}
                              {task.status !== 'IN_REVIEW' && (
                                <button
                                  className="btn btn-primary"
                                  style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                                  onClick={() => onUpdateStatus(task.id, 'IN_REVIEW')}
                                  title="Submit to In Review"
                                >
                                  <CheckCircle size={10} /> Review
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Task Activity */}
        <div>
          <ActivityFeed activities={assignedTaskActivity} title="My Task History" maxHeight="400px" />
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
