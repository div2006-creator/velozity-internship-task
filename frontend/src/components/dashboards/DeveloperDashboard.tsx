import React, { useState } from 'react';
import { CheckSquare, ArrowUpDown, Activity, CheckCircle, Clock } from 'lucide-react';

export interface DeveloperMetrics {
  totalAssignedTasks: number;
  assignedTasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    project?: { name: string };
  }>;
  prioritySorting: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    project?: { name: string };
  }>;
  assignedTaskActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: { name: string };
    formattedMessage?: string;
  }>;
}

interface DeveloperDashboardProps {
  metrics: DeveloperMetrics;
  onUpdateStatus?: (taskId: string, newStatus: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ metrics, onUpdateStatus }) => {
  const { assignedTasks, prioritySorting, assignedTaskActivity } = metrics;
  const [usePrioritySort, setUsePrioritySort] = useState<boolean>(true);

  const displayTasks = usePrioritySort ? prioritySorting : assignedTasks;

  return (
    <div className="dashboard-view developer-view">
      <div className="dashboard-header-title" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Developer Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Personal task queue, priority sorting, status update controls, and task history</p>
      </div>

      {/* Main Grid: Task Queue with Priority Sorting & Assigned Task Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Assigned Tasks & Priority Sorting Column */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} style={{ color: '#10b981' }} /> My Assigned Tasks ({assignedTasks.length})
            </h3>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => setUsePrioritySort(!usePrioritySort)}
            >
              <ArrowUpDown size={14} /> Sort by Priority: {usePrioritySort ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
            {displayTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No tasks currently assigned to you.</p>
            ) : (
              displayTasks.map((task) => {
                const priorityColors: Record<string, string> = {
                  LOW: '#94a3b8',
                  MEDIUM: '#38bdf8',
                  HIGH: '#f59e0b',
                  URGENT: '#ef4444',
                };
                const priorityColor = priorityColors[task.priority] || '#6366f1';

                return (
                  <div key={task.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project: {task.project?.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priorityColor, border: `1px solid ${priorityColor}50`, padding: '2px 8px', borderRadius: '4px' }}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Quick Status Change Buttons for Developer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                      <span className="status-badge online" style={{ fontSize: '0.75rem' }}>{task.status}</span>
                      {onUpdateStatus && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {task.status !== 'IN_PROGRESS' && (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                            >
                              <Clock size={12} /> Set In Progress
                            </button>
                          )}
                          {task.status !== 'IN_REVIEW' && (
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              onClick={() => onUpdateStatus(task.id, 'IN_REVIEW')}
                            >
                              <CheckCircle size={12} /> Submit to In Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assigned Task Activity Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#a855f7' }} /> Assigned-Task Activity Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '450px', overflowY: 'auto' }}>
            {assignedTaskActivity.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No recent activity for your assigned tasks.</p>
            ) : (
              assignedTaskActivity.map((log) => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {log.formattedMessage || `${log.user?.name || 'Developer'} updated task status`}
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

export default DeveloperDashboard;
